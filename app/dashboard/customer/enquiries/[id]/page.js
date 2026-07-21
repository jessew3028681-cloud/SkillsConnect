'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import StarRating from '@/components/StarRating';
import ProfileAvatar from '@/components/ProfileAvatar';
import LoadingSpinner from '@/components/LoadingSpinner';
import AlertMessage from '@/components/AlertMessage';

export default function CustomerEnquiryDetail() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [enquiry, setEnquiry] = useState(null);
  const [artisanProfile, setArtisanProfile] = useState(null);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;

    async function fetchEnquiryDetails() {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch Enquiry Detail
        const enqRes = await fetch(`/api/enquiries/${id}`);
        if (!enqRes.ok) {
          throw new Error('Failed to retrieve enquiry thread details.');
        }
        
        const enqData = await enqRes.json();
        if (!enqData.success || !enqData.data) {
          throw new Error(enqData.error || 'Enquiry details could not be found.');
        }

        const enquiryObj = enqData.data;
        setEnquiry(enquiryObj);

        // 2. Fetch Artisan Full Profile to get rating, category etc.
        const artisanRes = await fetch(`/api/artisans/${enquiryObj.artisan_id}`);
        if (artisanRes.ok) {
          const artisanData = await artisanRes.json();
          if (artisanData.success && artisanData.data) {
            setArtisanProfile(artisanData.data);
          }
        }

        // 3. Fetch My Reviews to check if I have already reviewed this artisan
        const reviewCheckRes = await fetch('/api/reviews?user_id=me');
        if (reviewCheckRes.ok) {
          const reviewData = await reviewCheckRes.json();
          if (reviewData.success && Array.isArray(reviewData.data)) {
            const alreadyReviewed = reviewData.data.some(
              (r) => parseInt(r.artisan_id, 10) === parseInt(enquiryObj.artisan_id, 10)
            );
            setHasReviewed(alreadyReviewed);
          }
        }

      } catch (err) {
        console.error('Error fetching enquiry details:', err);
        setError(err.message || 'An error occurred while loading this enquiry page.');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchEnquiryDetails();
    }
  }, [id, user, authLoading]);

  if (authLoading) {
    return <LoadingSpinner message="Verifying authentication..." fullPage />;
  }

  if (!user) {
    return (
      <div className="container py-5 text-center" id="unauthorized-placeholder">
        <AlertMessage type="danger" message="Access Denied. Redirecting to login..." />
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner message="Retrieving communication thread..." />;
  }

  if (error || !enquiry) {
    return (
      <DashboardLayout role="customer" pageTitle="Enquiry Details">
        <div className="p-4" id="enquiry-error-view">
          <AlertMessage type="danger" message={error || 'Enquiry details could not be loaded.'} />
          <Link href="/dashboard/customer/enquiries" className="btn btn-primary rounded-pill">
            <i className="fa-solid fa-arrow-left me-2"></i>
            <span>Back to My Enquiries</span>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate rating fields
  const rating = parseFloat(artisanProfile?.average_rating || 0);
  const totalReviews = parseInt(artisanProfile?.total_reviews || 0, 10);
  const status = (enquiry.status || 'pending').toLowerCase();

  return (
    <DashboardLayout role="customer" pageTitle={`Enquiry Ref: #SC-${enquiry.enquiry_id}`}>
      <div className="container-fluid px-0" id="customer-enquiry-thread">
        
        {/* Back navigation Row */}
        <div className="mb-4">
          <Link 
            href="/dashboard/customer/enquiries" 
            className="btn btn-outline-secondary px-3 py-2 rounded-pill d-inline-flex align-items-center gap-1.5 hover-bg-light"
          >
            <i className="fa-solid fa-arrow-left fs-7"></i>
            <span>Back to Enquiries</span>
          </Link>
        </div>

        {/* 1. ARTISAN INFO HEADER CARD */}
        <div className="card border rounded-3 p-4 bg-light mb-4 shadow-xs" id="enquiry-artisan-header-card">
          <div className="row align-items-center g-3">
            <div className="col-auto">
              <ProfileAvatar 
                name={enquiry.artisan_name} 
                photo_url={enquiry.artisan_photo} 
                size="lg" 
              />
            </div>
            <div className="col flex-grow-1">
              <span className="badge bg-primary text-white text-capitalize rounded-pill px-2.5 py-1 mb-2 fs-8">
                {artisanProfile?.category_name || 'Verified Artisan'}
              </span>
              <h4 className="fw-bold text-dark mb-1">{enquiry.artisan_name}</h4>
              
              <div className="d-flex flex-wrap align-items-center gap-3 fs-7 text-secondary mt-1">
                {/* Rating row */}
                <div className="d-flex align-items-center gap-1.5">
                  <StarRating rating={rating} size="sm" />
                  <strong className="text-dark">{rating.toFixed(1)}</strong>
                  <span className="text-muted">({totalReviews} reviews)</span>
                </div>
                
                {/* Location row */}
                {artisanProfile && (
                  <div className="d-flex align-items-center gap-1">
                    <i className="fa-solid fa-location-dot text-danger"></i>
                    <span>{artisanProfile.district ? `${artisanProfile.district}, ${artisanProfile.region}` : artisanProfile.region}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="col-12 col-md-auto text-md-end">
              <Link 
                href={`/artisans/${enquiry.artisan_id}`} 
                className="btn btn-sm btn-outline-primary px-4 py-2 rounded-pill fw-semibold"
              >
                View Profile Page
              </Link>
            </div>
          </div>
        </div>

        {/* 2. SUBJECT HEADING BLOCK */}
        <div className="bg-white p-3 rounded-3 border mb-4 d-flex justify-content-between align-items-center shadow-xs" id="enquiry-subject-bar">
          <div>
            <span className="text-muted fs-8 text-uppercase tracking-wider d-block fw-semibold" style={{ fontSize: '11px' }}>
              Enquiry Subject
            </span>
            <h5 className="fw-bold text-dark mb-0">{enquiry.subject}</h5>
          </div>
          <div>
            <span className={`badge px-3 py-2 rounded-pill fs-7 text-capitalize ${
              status === 'pending' ? 'bg-warning text-dark' : 'bg-success text-white'
            }`}>
              Status: {status}
            </span>
          </div>
        </div>

        {/* 3. CONVERSATION THREAD */}
        <div className="card border rounded-3 p-4 bg-white mb-4 shadow-sm" id="enquiry-conversation-thread">
          <div className="d-flex flex-column gap-4">
            
            {/* Customer Message (Right Aligned, Green Theme) */}
            <div className="d-flex flex-column align-items-end" id="enquiry-customer-bubble">
              <div className="d-flex align-items-center gap-2 mb-1.5">
                <span className="fw-semibold text-dark fs-7">You (Client)</span>
                <span className="text-muted fs-8">
                  {enquiry.created_at ? new Date(enquiry.created_at).toLocaleDateString('en-GH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                </span>
              </div>
              <div 
                className="p-3.5 rounded-3 text-white fs-6 shadow-xs max-w-75" 
                style={{ 
                  backgroundColor: '#1A6B3C', 
                  borderRadius: '16px 16px 0px 16px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-line',
                  maxWidth: '80%'
                }}
              >
                {enquiry.message}
              </div>
            </div>

            {/* Artisan Reply (Left Aligned, Grey Theme) */}
            {enquiry.reply ? (
              <div className="d-flex flex-column align-items-start" id="enquiry-artisan-bubble">
                <div className="d-flex align-items-center gap-2 mb-1.5">
                  <span className="fw-semibold text-dark fs-7">{enquiry.artisan_name}</span>
                  <span className="text-muted fs-8">
                    {enquiry.replied_at ? new Date(enquiry.replied_at).toLocaleDateString('en-GH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                  </span>
                </div>
                <div className="d-flex gap-2.5 w-100 align-items-start">
                  <div className="flex-shrink-0">
                    <ProfileAvatar 
                      name={enquiry.artisan_name} 
                      photo_url={enquiry.artisan_photo} 
                      size="sm" 
                    />
                  </div>
                  <div 
                    className="p-3.5 rounded-3 bg-light text-dark fs-6 shadow-xs border" 
                    style={{ 
                      borderRadius: '0px 16px 16px 16px',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-line',
                      maxWidth: '80%'
                    }}
                  >
                    {enquiry.reply}
                  </div>
                </div>
              </div>
            ) : (
              /* Awaiting Reply Indicator */
              <div className="p-4 rounded-3 border-dashed border-warning bg-warning-subtle text-warning-emphasis d-flex align-items-center gap-3" id="awaiting-reply-notification">
                <div className="bg-warning text-white p-2.5 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
                  <i className="fa-solid fa-hourglass-half fs-5"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-1">Awaiting Artisan Response</h6>
                  <p className="mb-0 fs-7 text-secondary">
                    Your trade enquiry status is currently <strong>Pending</strong>. You will be notified by email once {enquiry.artisan_name} replies to your message.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* 4. ACTIONS / WRITE REVIEW CTA BLOCK */}
        {status !== 'pending' && !hasReviewed && (
          <div className="card border rounded-3 p-4 text-center bg-light shadow-xs" id="enquiry-review-cta-card">
            <div className="rounded-circle bg-warning-subtle text-warning p-3 d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
              <i className="fa-solid fa-star fs-3"></i>
            </div>
            <h5 className="fw-bold text-dark mb-1">How was your interaction with {enquiry.artisan_name}?</h5>
            <p className="text-secondary fs-7 mb-4 px-2" style={{ maxWidth: '600px', margin: '0 auto' }}>
              Your feedback is crucial for maintaining the quality of SkillsConnect Ghana! Share your ratings and testimonials of this artisan&apos;s trade work.
            </p>
            <Link 
              href={`/dashboard/customer/reviews/new?artisan_id=${enquiry.artisan_id}`} 
              className="btn btn-warning px-5 py-2.5 rounded-pill shadow-sm fw-bold text-dark d-inline-flex align-items-center gap-2"
            >
              <i className="fa-solid fa-pen-nib"></i>
              <span>Leave a Review for this Artisan</span>
            </Link>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
