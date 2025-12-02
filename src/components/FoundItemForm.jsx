import React, { useState, useRef, useEffect } from 'react';
import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import tigerLogo from '../assets/tiger.png';
import '../styles/FoundItemForm.css';

const FoundItemForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    finderName: '', itemName: '', category: '', occupancy: '',
    floor: '', location: '', specificLocation: '', specificCategory: '',
    date: '', time: '', description: '', contactNumber: '', contactEmail: '',
  });

  const [roomOptions, setRoomOptions] = useState([]);
  const [isRoomDropdownOpen, setIsRoomDropdownOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const categories = [
    'Electronics', 'Bags & Backpacks', 'Books & Notebooks',
    'Clothing & Accessories', 'ID Cards & Documents', 'Keys',
    'Water Bottles & Containers', 'Umbrellas'
  ];
  const occupancies = ['Student', 'Faculty', 'Staff'];
  const floors = ['17th Floor', '18th Floor', '19th Floor', '20th Floor'];
  const locations = ['Room', 'Hallway', 'Bathroom', 'Fire Exit', 'Lobby', 'Others'];

  // Get current date in Philippine timezone (UTC+8)
  const getPhilippineDate = () => {
    const now = new Date();
    const phTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    const year = phTime.getFullYear();
    const month = String(phTime.getMonth() + 1).padStart(2, '0');
    const day = String(phTime.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (formData.floor && formData.location === 'Room') {
      const floorNumber = formData.floor.replace(/\D/g, '');
      const rooms = [];
      for (let i = 1; i <= 15; i++) rooms.push(`${floorNumber}${i < 10 ? '0' + i : i}`);
      setRoomOptions(rooms);
      setFormData(prev => ({ ...prev, specificLocation: '' }));
    } else {
      setRoomOptions([]);
    }
  }, [formData.floor, formData.location]);

  const handleFormattedContact = (e) => {
    let input = e.target.value.replace(/\D/g, "");
    if (input.length === 0) { setFormData({ ...formData, contactNumber: "" }); return; }
    let formatted = input.substring(0, 11);
    if (input.length > 4) formatted = input.substring(0, 4) + "-" + input.substring(4);
    if (input.length > 7) formatted = input.substring(0, 4) + "-" + input.substring(4, 7) + "-" + input.substring(7);
    setFormData({ ...formData, contactNumber: formatted });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } } });
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(console.error);
        }
      }, 100);
    } catch (err) {
      setIsCameraActive(false);
      setErrorMessage('Unable to access camera. Please check your permissions.');
      setShowErrorModal(true);
    }
  };

  const stopCamera = () => {
    const video = videoRef.current;
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      setPhotoPreview(canvas.toDataURL('image/png'));
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setPhotoPreview(null);
    setTimeout(startCamera, 50);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const BASE_URL = 'http://localhost:5000';
      
      const response = await fetch(`${BASE_URL}/api/found`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          formData,
          photoUrl: photoPreview 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit found item report');
      }

      setSuccessMessage(data.message || 'Your found item report has been submitted successfully.');
      setIsSubmitting(false);
      setShowSuccessModal(true);
      
      // Trigger a custom event to refresh the items
      window.dispatchEvent(new Event('itemsUpdated'));
      
      // Reset form
      setFormData({
        finderName: '', itemName: '', category: '', occupancy: '', floor: '',
        location: '', specificLocation: '', specificCategory: '', date: '', time: '',
        description: '', contactNumber: '', contactEmail: '',
      });
      setPhotoPreview(null);
    } catch (error) {
      console.error('Submission Error:', error);
      setIsSubmitting(false);
      setErrorMessage(error.message);
      setShowErrorModal(true);
    }
  };

  return (
    <div className="found-form-page">
      <div className="found-form-container">
        <div className="found-form-header">
          <img src={tigerLogo} alt="TigerTrack Logo" />
          <h1>TigerTrack</h1>
          <p>UST-CICS Lost and Found System</p>
        </div>

        <div className="found-form-body">
          <Button className="found-back-button" onClick={() => navigate('/')}>← Back</Button>
          <h5 className="found-form-section-title">Report a Found Item</h5>
          <p className="found-form-subtext">Fill out the form below to report your found item.</p>

          <Form onSubmit={handleSubmit}>
            <div className="form-grid">
              <Form.Group className="mb-3">
                <Form.Label>Name of the Finder</Form.Label>
                <Form.Control type="text" placeholder="Enter full name" name="finderName" value={formData.finderName} onChange={handleChange} required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>What is your occupation?</Form.Label>
                <Form.Select name="occupancy" value={formData.occupancy} onChange={handleChange} required>
                  <option value="">Select your occupation</option>
                  {occupancies.map((o, i) => <option key={i}>{o}</option>)}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>What item did you find?</Form.Label>
                <Form.Control type="text" placeholder="Enter item name" name="itemName" value={formData.itemName} onChange={handleChange} required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Category of your Item</Form.Label>
                <Form.Select name="category" value={formData.category} onChange={handleChange} required>
                  <option value="">Select a category</option>
                  {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                  <option value="Others">Others</option>
                </Form.Select>
              </Form.Group>

              {formData.category === 'Others' && (
                <Form.Group className="mb-3">
                  <Form.Label>Please specify the other category</Form.Label>
                  <Form.Control type="text" name="specificCategory" placeholder="Enter the category" value={formData.specificCategory || ''} onChange={handleChange} required />
                </Form.Group>
              )}

              <Form.Group className="mb-3">
                <Form.Label>What floor did you find the item?</Form.Label>
                <Form.Select name="floor" value={formData.floor} onChange={handleChange} required>
                  <option value="">Select a floor</option>
                  {floors.map((f, i) => <option key={i}>{f}</option>)}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Where did you find the item?</Form.Label>
                <Form.Select name="location" value={formData.location} onChange={handleChange} required>
                  <option value="">Select a location</option>
                  {locations.map((l, i) => <option key={i}>{l}</option>)}
                </Form.Select>
              </Form.Group>

              {formData.location === 'Room' && (
                <Form.Group className="mb-3">
                  <Form.Label>Please specify the room</Form.Label>
                  <div className="custom-dropdown-wrapper">
                    <div className={`custom-dropdown-select ${!formData.floor ? 'disabled' : ''} ${isRoomDropdownOpen ? 'open' : ''}`} onClick={() => formData.floor && setIsRoomDropdownOpen(!isRoomDropdownOpen)}>
                      <span className={formData.specificLocation ? '' : 'placeholder'}>
                        {formData.specificLocation || (formData.floor ? 'Select a room' : 'Select a floor first')}
                      </span>
                      <svg className="dropdown-arrow" width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    </div>
                    {isRoomDropdownOpen && formData.floor && (
                      <>
                        <div className="custom-dropdown-overlay" onClick={() => setIsRoomDropdownOpen(false)} />
                        <div className="custom-dropdown-menu">
                          {roomOptions.map((room, idx) => (
                            <div key={idx} className={`custom-dropdown-option ${formData.specificLocation === room ? 'selected' : ''}`} onClick={() => { setFormData((prev) => ({ ...prev, specificLocation: room })); setIsRoomDropdownOpen(false); }}>{room}</div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </Form.Group>
              )}

              {formData.location === 'Others' && (
                <Form.Group className="mb-3">
                  <Form.Label>Please specify the others</Form.Label>
                  <Form.Control type="text" name="specificLocation" placeholder="Enter detailed location" value={formData.specificLocation || ''} onChange={handleChange} required />
                </Form.Group>
              )}

              <Form.Group className="mb-3">
                <Form.Label>When did you find it?</Form.Label>
                <Form.Control type="date" name="date" value={formData.date} onChange={handleChange} max={getPhilippineDate()} required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>What time did you find it?</Form.Label>
                <Form.Control type="time" name="time" value={formData.time} onChange={handleChange} required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>What is your contact email?</Form.Label>
                <Form.Control type="email" placeholder="Enter valid email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>What is your contact number?</Form.Label>
                <Form.Control type="text" placeholder="09XX-XXX-XXXX" name="contactNumber" value={formData.contactNumber} onChange={handleFormattedContact} maxLength={13} pattern="^09\d{2}-\d{3}-\d{4}$" required />
                <Form.Control.Feedback type="invalid">Please enter a valid Philippine mobile number.</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3 form-full-width">
                <Form.Label>Take a photo using the webcam</Form.Label>
                <div className={`photo-upload-box ${isCameraActive ? 'camera-active' : ''}`}>
                  {photoPreview ? (
                    <>
                      <img src={photoPreview} alt="Preview" className="photo-preview" />
                      <p className="photo-hint" onClick={retakePhoto} style={{ cursor: 'pointer', color: '#8b0000', marginTop: '10px', fontWeight: '600' }}>🔄 Click to retake photo</p>
                    </>
                  ) : isCameraActive ? (
                    <div className="camera-container">
                      <div className="video-wrapper">
                        <video ref={videoRef} autoPlay playsInline muted className="photo-video" onLoadedMetadata={() => console.log("Video loaded successfully")} />
                      </div>
                      <div className="camera-controls">
                        <Button variant="danger" onClick={stopCamera} className="camera-btn cancel-btn" type="button">✖ Cancel</Button>
                        <Button variant="primary" onClick={takePhoto} className="camera-btn capture-btn" type="button">📷 Capture Photo</Button>
                      </div>
                    </div>
                  ) : (
                    <div onClick={startCamera} style={{ cursor: 'pointer', padding: '40px' }}>
                      <div className="photo-icon">📷</div>
                      <p className="photo-text">Click to open camera</p>
                    </div>
                  )}
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>
              </Form.Group>

              <Form.Group className="mb-3 form-full-width">
                <Form.Label>Describe the item (Optional)</Form.Label>
                <Form.Control as="textarea" rows={3} placeholder="Describe the item" name="description" value={formData.description} onChange={handleChange} />
              </Form.Group>
            </div>

            <Button type="submit" className="found-submit-button" disabled={isSubmitting}>
              {isSubmitting ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />Submitting...</> : 'Submit Report'}
            </Button>
          </Form>
        </div>
      </div>

      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered backdrop="static" className="custom-modal success-modal">
        <Modal.Body className="modern-modal-body">
          <div className="modal-icon-wrapper success-icon-wrapper">
            <div className="success-checkmark"><svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/><path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/></svg></div>
          </div>
          <h3 className="modal-title">Success!</h3>
          <p className="modal-message">{successMessage}</p>
          <Button className="modal-button success-button" onClick={() => { setShowSuccessModal(false); navigate('/'); }}>Return to Home</Button>
        </Modal.Body>
      </Modal>

      <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)} centered className="custom-modal error-modal">
        <Modal.Body className="modern-modal-body">
          <div className="modal-icon-wrapper error-icon-wrapper">
            <div className="error-x"><svg className="error-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle className="error-circle" cx="26" cy="26" r="25" fill="none"/><path className="error-line error-line1" fill="none" d="M16 16 L36 36"/><path className="error-line error-line2" fill="none" d="M36 16 L16 36"/></svg></div>
          </div>
          <h3 className="modal-title">Oops!</h3>
          <p className="modal-message">{errorMessage}</p>
          <Button className="modal-button error-button" onClick={() => setShowErrorModal(false)}>Try Again</Button>
        </Modal.Body> 
      </Modal>
    </div>
  );
};

export default FoundItemForm;