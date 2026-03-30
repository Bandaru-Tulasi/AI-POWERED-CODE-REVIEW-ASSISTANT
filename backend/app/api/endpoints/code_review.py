"""
Code review endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Body, Request
from sqlalchemy.orm import Session
from typing import Dict, Any, List
import logging
from datetime import datetime

from app.database.session import get_db
from app.services.code_analysis_service import code_analysis_service
from app.schemas.code_review import CodeReviewCreate, CodeReviewResponse, CodeAnalysisRequest
from app.models.code_review import CodeReview
from app.models.user import User
from app.core.config import settings
from app.core.dependencies import get_current_active_user

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/code-reviews")
def get_code_reviews(
    current_user: User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """
    Get all code reviews for the current user
    """
    try:
        logger.info(f"Fetching code reviews for user {current_user.id} with skip={skip}, limit={limit}")
        
        # Get reviews for this user
        reviews = db.query(CodeReview).filter(
            CodeReview.reviewer_id == current_user.id
        ).order_by(CodeReview.created_at.desc()).offset(skip).limit(limit).all()
        
        logger.info(f"Found {len(reviews)} reviews for user {current_user.email}")
        
        # Format each review to match frontend expectations
        formatted_reviews = []
        for review in reviews:
            try:
                formatted_reviews.append({
                    "id": review.id,
                    "title": review.title,
                    "description": review.description,
                    "status": review.status,
                    "priority": review.priority,
                    "created_at": review.created_at.isoformat() if review.created_at else None,
                    "updated_at": review.updated_at.isoformat() if review.updated_at else None,
                    "code": review.code_content,
                    "language": review.language or "python",
                    "analysis_result": review.ai_analysis or {},
                    "repository_id": review.repository_id,
                    "branch_name": review.branch_name,
                    "pull_request_url": review.pull_request_url,
                    "pull_request_number": review.pull_request_number,
                    "files_changed": review.files_changed,
                    "additions": review.additions,
                    "deletions": review.deletions,
                    "reviewer_id": review.reviewer_id
                })
            except Exception as e:
                logger.error(f"Error formatting review {review.id}: {str(e)}")
                # Skip this review if formatting fails
                continue
        
        return formatted_reviews
        
    except Exception as e:
        logger.error(f"Failed to get code reviews: {str(e)}", exc_info=True)
        # Return empty list instead of raising 500 to keep dashboard functional
        return []


@router.post("/code-reviews")
def create_code_review(
    review_data: CodeReviewCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Create a new code review
    """
    try:
        logger.info(f"Creating code review with data: {review_data}")
        
        # Extract scores from analysis result if available
        overall_score = None
        security_score = None
        quality_score = None
        
        if review_data.analysis_result:
            overall_score = review_data.analysis_result.get("overall_score")
            security_score = review_data.analysis_result.get("security", {}).get("score")
            quality_score = review_data.analysis_result.get("quality", {}).get("score")
        
        # Create review in database
        db_review = CodeReview(
            title=review_data.title,
            description=review_data.description,
            repository_id=review_data.repository_id,
            branch_name=review_data.branch_name,
            pull_request_url=review_data.pull_request_url,
            pull_request_number=review_data.pull_request_number,
            files_changed=review_data.files_changed or 0,
            additions=review_data.additions or 0,
            deletions=review_data.deletions or 0,
            reviewer_id=current_user.id,
            status=review_data.status or "pending",
            priority=review_data.priority or "medium",
            code_content=review_data.code,
            language=review_data.language or "python",
            ai_analysis=review_data.analysis_result,
            overall_score=overall_score,
            security_score=security_score,
            quality_score=quality_score,
            created_at=datetime.utcnow()
        )
        
        db.add(db_review)
        db.commit()
        db.refresh(db_review)
        
        logger.info(f"Code review created successfully with ID: {db_review.id}")
        
        # Format response
        return {
            "id": db_review.id,
            "title": db_review.title,
            "description": db_review.description,
            "status": db_review.status,
            "priority": db_review.priority,
            "created_at": db_review.created_at.isoformat() if db_review.created_at else None,
            "updated_at": db_review.updated_at.isoformat() if db_review.updated_at else None,
            "code": db_review.code_content,
            "language": db_review.language,
            "analysis_result": db_review.ai_analysis,
            "repository_id": db_review.repository_id,
            "branch_name": db_review.branch_name,
            "pull_request_url": db_review.pull_request_url,
            "pull_request_number": db_review.pull_request_number,
            "files_changed": db_review.files_changed,
            "additions": db_review.additions,
            "deletions": db_review.deletions,
            "reviewer_id": db_review.reviewer_id
        }
        
    except Exception as e:
        logger.error(f"Failed to create code review: {str(e)}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create code review: {str(e)}"
        )

@router.post("/code-reviews/analyze")
async def analyze_code(
    analysis_request: CodeAnalysisRequest = Body(...),
) -> Dict[str, Any]:
    """
    Analyze code using AI
    """
    try:
        code = analysis_request.code
        language = analysis_request.language or "python"
        analysis_type = analysis_request.analysis_type or "comprehensive"
        
        if not code or len(code.strip()) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Code cannot be empty"
            )
        
        logger.info(f"Analyzing {language} code (type: {analysis_type}, length: {len(code)} chars)")
        
        # Perform analysis based on type
        if analysis_type == "security":
            result = await code_analysis_service.analyze_code_security(code, language)
        elif analysis_type == "quality":
            result = await code_analysis_service.analyze_code_quality(code, language)
        elif analysis_type == "complexity":
            result = await code_analysis_service.analyze_code_complexity(code, language)
        elif analysis_type == "suggestions":
            result = await code_analysis_service.get_code_suggestions(code, language)
        else:  # comprehensive
            result = await code_analysis_service.comprehensive_analysis(code, language)
        
        return {
            "success": True,
            "analysis_type": analysis_type,
            "language": language,
            "code_length": len(code),
            "result": result
        }
        
    except Exception as e:
        logger.error(f"Code analysis failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )

@router.get("/code-reviews/{review_id}")
def get_code_review(
    review_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Get a specific code review by ID
    """
    try:
        review = db.query(CodeReview).filter(CodeReview.id == review_id).first()
        
        if not review:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Code review not found"
            )
        
        # Check if review belongs to user
        if review.reviewer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this review"
            )
        
        # Format response
        return {
            "id": review.id,
            "title": review.title,
            "description": review.description,
            "status": review.status,
            "priority": review.priority,
            "created_at": review.created_at.isoformat() if review.created_at else None,
            "updated_at": review.updated_at.isoformat() if review.updated_at else None,
            "code": review.code_content,
            "language": review.language,
            "analysis_result": review.ai_analysis,
            "repository_id": review.repository_id,
            "branch_name": review.branch_name,
            "pull_request_url": review.pull_request_url,
            "pull_request_number": review.pull_request_number,
            "files_changed": review.files_changed,
            "additions": review.additions,
            "deletions": review.deletions,
            "reviewer_id": review.reviewer_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get code review: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get code review: {str(e)}"
        )


@router.post("/code-reviews/batch-analyze")
async def batch_analyze_code(
    files: List[Dict[str, str]] = Body(...),
) -> Dict[str, Any]:
    """
    Analyze multiple code files at once
    """
    try:
        if not files:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No files provided"
            )
        
        results = []
        total_issues = 0
        total_suggestions = 0
        
        for file_data in files:
            code = file_data.get("code", "")
            language = file_data.get("language", "python")
            filename = file_data.get("filename", "unknown")
            
            if code:
                analysis_result = await code_analysis_service.comprehensive_analysis(code, language)
                
                results.append({
                    "filename": filename,
                    "language": language,
                    "result": analysis_result
                })
                
                if analysis_result.get("success", False):
                    if "security" in analysis_result:
                        total_issues += analysis_result["security"].get("issues_found", 0)
                    if "quality" in analysis_result:
                        total_issues += analysis_result["quality"].get("issues_found", 0)
                    if "suggestions" in analysis_result:
                        total_suggestions += analysis_result["suggestions"].get("suggestions_provided", 0)
        
        return {
            "success": True,
            "files_analyzed": len(results),
            "total_issues": total_issues,
            "total_suggestions": total_suggestions,
            "results": results
        }
        
    except Exception as e:
        logger.error(f"Batch analysis failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch analysis failed: {str(e)}"
        )