'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import AlertMessage from '@/components/AlertMessage';

export default function ArtisanEnquiryDetail() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const enquiryId = params.id;

  const [enquiry, setEnquiry] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);

  // REPLY FORM STATE
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  // FETCH ENQUIRY DETAIL
  const fetchEnquiryDetail = useCallback(async () => {
    try {
      setLoadingData(true);
      setError(null);

      const response = await fetch(`/api/enquiries/${enquiryId}`);
      const result = await response.json();

      if (response.ok && result.success && result.data) {
        setEnquiry(result.data);
        if (result.data.reply) {
          setReplyText(result.data.reply);
        }
      } else {
        setError(result.error || 'Failed to download enquiry details.');
      }
    } catch (err) {
      console.error('Error fetching enquiry details:', err);
      setError('Could not establish contact with servers.');
    } finally {
      setLoadingData(false);
    }
  }, [enquiryId]);

  useEffect(() => {
    if (!authLoading && user && enquiryId) {
      const timer = setTimeout(() => {
        fetchEnquiryDetail();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading, enquiryId, fetchEnquiryDetail]);

  // SUBMIT REPLY
  const handleReplySubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!replyText.trim()) {
      setError('Please enter a response message before submitting.');
      return;
    }

    if (replyText.trim().length > 1000) {
      setError('Response message is too long (Max 1000 characters).');
      return;
    }

    try {
      setSubmittingReply(true);

      const response = await fetch(`/api/enquiries/${enquiryId}/reply`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reply: replyText.trim()
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccessMsg('Your reply was successfully saved and dispatched to the customer!');
        // Refresh local data
        fetchEnquiryDetail();
      } else {
        setError(result.error || 'An error occurred while submitting your response.');
      }
    } catch (err) {
      console.error('Error submitting reply:', err);
      setError('A connection exception occurred while transmitting your reply.');
    } finally {
      setSubmittingReply(false);
    }
  };

  if (authLoading) {
    return <LoadingSpinner message="Verifying credentials..." fullPage />;
  }

  if (!user || user.role !== 'artisan') {
    return (
      <div className="container py-5 text-center" id="unauthorized-placeholder">
        <AlertMessage type="danger" message="Access Denied. Only artisans can reply to enquiries." />
      </div>
    );
  }

  const cleanPhone = enquiry?.customer_phone ? enquiry.customer_phone.replace(/[^0-9]/g, '') : '';
  const waUrl = `https://wa.me/${cleanPhone}`;

  return (
    <DashboardLayout role="artisan" pageTitle="Enquiry Details">
      <div className="container-fluid px-0" id="artisan-enquiry-detail-view">
        
        {/* Navigation Breadcrumb & Back */}
        <div className="mb-4 d-flex justify-content-between align-items-center">
          <Link href="/dashboard/artisan/enquiries" className="btn btn-sm btn-light text-secondary rounded-pill px-3 py-2 fw-semibold d-inline-flex align-items-center gap-1.5">
            <i className="fa-solid fa-arrow-left"></i>
            <span>Back to Enquiries</span>
          </Link>
          <span className="text-muted fs-8">Enquiry ID: #{enquiryId}</span>
        </div>

        {error && <AlertMessage type="danger" message={error} onClose={() => setError(null)} />}
        {successMsg && <AlertMessage type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />}

        {loadingData ? (
          <LoadingSpinner message="Retrieving enquiry details..." />
        ) : !enquiry ? (
          <div className="text-center py-5">
            <p className="text-muted">No details found for this enquiry ID.</p>
          </div>
        ) : (
          <div className="row g-4">
            
            {/* LEFT COLUMN: ENQUIRY DETAILS */}
            <div className="col-12 col-lg-7">
              <div className="card border rounded-3 p-4 bg-white shadow-xs h-100">
                
                {/* Header info */}
                <div className="border-bottom pb-3.5 mb-3.5">
                  <span className="badge bg-primary-subtle text-primary text-uppercase rounded-pill px-2.5 py-1 fs-8 fw-semibold tracking-wider mb-2">
                    Client Work Request
                  </span>
                  <h4 className="fw-bold text-dark mb-2">{enquiry.subject}</h4>
                  <div className="text-muted fs-7.5 d-flex align-items-center gap-2">
                    <i className="fa-regular fa-clock"></i>
                    <span>Received on: {enquiry.created_at ? new Date(enquiry.created_at).toLocaleString('en-GH', { dateStyle: 'long', timeStyle: 'short' }) : 'Recently'}</span>
                  </div>
                </div>

                {/* Message Bubble */}
                <div className="mb-4">
                  <label className="fw-semibold text-muted fs-8 uppercase tracking-wider mb-2">Enquiry Message Text</label>
                  <div className="p-3.5 bg-light rounded-3 text-dark fs-7.5" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                    {enquiry.message}
                  </div>
                </div>

                {/* Response History block */}
                {enquiry.reply && (
                  <div className="border-start border-success border-4 p-3.5 bg-success-subtle rounded-3 mt-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong className="text-success fs-7.5 d-flex align-items-center gap-1.5">
                        <i className="fa-solid fa-reply"></i>
                        <span>Your Submitted Reply</span>
                      </strong>
                      <small className="text-muted fs-8">
                        {enquiry.replied_at ? new Date(enquiry.replied_at).toLocaleDateString('en-GH') : 'Recently'}
                      </small>
                    </div>
                    <p className="text-dark mb-0 fs-7.5 italic" style={{ fontStyle: 'italic', lineHeight: '1.5' }}>
                      &quot;{enquiry.reply}&quot;
                    </p>
                  </div>
                )}

              </div>
            </div>

            {/* RIGHT COLUMN: ACTION & CONTACT */}
            <div className="col-12 col-lg-5">
              
              {/* CONTACT BOX */}
              <div className="card border rounded-3 p-4 bg-white shadow-xs mb-4">
                <h5 className="fw-bold text-dark mb-3">Client Information</h5>
                
                <div className="d-flex align-items-center gap-3 mb-4 p-2 bg-light rounded-3 border-0">
                  <div 
                    className="rounded-circle bg-primary text-white fw-bold d-flex align-items-center justify-content-center"
                    style={{ width: '52px', height: '52px', fontSize: '16px' }}
                  >
                    {enquiry.customer_name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                  </div>
                  <div>
                    <strong className="text-dark fs-6 d-block">{enquiry.customer_name}</strong>
                    <span className="text-muted fs-8 uppercase tracking-wider fw-semibold">SkillsConnect Customer</span>
                  </div>
                </div>

                {/* Quick Info contacts */}
                <div className="d-flex flex-column gap-3 mb-3">
                  <div className="d-flex align-items-center gap-2.5">
                    <div className="rounded-2 bg-light p-2 text-muted" style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="fa-solid fa-envelope fs-7"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block fs-8.5">Email Address</small>
                      <a href={`mailto:${enquiry.customer_email}`} className="text-primary text-decoration-none fs-7 fw-semibold">
                        {enquiry.customer_email}
                      </a>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2.5">
                    <div className="rounded-2 bg-light p-2 text-muted" style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="fa-solid fa-phone fs-7"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block fs-8.5">Phone Number</small>
                      <a href={`tel:${enquiry.customer_phone}`} className="text-dark text-decoration-none fs-7 fw-semibold">
                        {enquiry.customer_phone}
                      </a>
                    </div>
                  </div>
                </div>

                {/* WHATSAPP LINK */}
                {enquiry.customer_phone && (
                  <div className="border-top pt-3.5 mt-2">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-success w-100 py-2.5 rounded-pill fw-bold text-white d-flex align-items-center justify-content-center gap-2"
                    >
                      <i className="fa-brands fa-whatsapp fs-5"></i>
                      <span>Chat on WhatsApp</span>
                    </a>
                  </div>
                )}
              </div>

              {/* REPLY FORM */}
              <div className="card border rounded-3 p-4 bg-white shadow-xs">
                <h5 className="fw-bold text-dark mb-1">Reply Form</h5>
                <p className="text-muted mb-4 fs-8">Reply through SkillsConnect platform. An email notification will be dispatched immediately.</p>

                {enquiry.reply && (
                  <div className="alert alert-warning border-0 rounded-3 p-3 mb-4 fs-8" id="reply-overwrite-warning">
                    <i className="fa-solid fa-circle-info me-1.5 text-warning-emphasis"></i>
                    <span>You have already replied to this enquiry. Submitting a new message will overwrite your previous reply.</span>
                  </div>
                )}

                <form onSubmit={handleReplySubmit}>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1.5">
                      <label htmlFor="enquiry-reply" className="form-label fw-semibold text-dark fs-7.5 mb-0">
                        Response Message
                      </label>
                      <span className={`fs-8 fw-bold ${replyText.length > 900 ? 'text-danger' : 'text-success'}`}>
                        {replyText.length}/1000 characters
                      </span>
                    </div>
                    <textarea
                      id="enquiry-reply"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value.substring(0, 1000))}
                      className="form-control shadow-none fs-7.5"
                      rows="6"
                      placeholder="Type your response message here. Be polite, clear on pricing guidelines, availability hours, and scope details..."
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReply}
                    className="btn btn-primary w-100 py-2.5 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2"
                    style={{ cursor: submittingReply ? 'not-allowed' : 'pointer' }}
                  >
                    {submittingReply ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span>Transmitting Reply...</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-paper-plane"></i>
                        <span>Submit Reply</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

            </div>

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
