import React, { useState, useRef } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import tigerLogo from '../assets/tiger.png';
import './FoundItemForm.css';

const FoundItemForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    occupancy: '',
    floor: '',
    location: '',
    specificLocation: '',
    date: '',
    time: '',
    description: '',
    contactNumber: '',
    contactEmail: '',
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const categories = [
    'Electronics', 'Bags & Backpacks', 'Books & Notebooks',
    'Clothing & Accessories', 'ID Cards & Documents', 'Keys',
    'Water Bottles & Containers', 'Umbrellas', 'Others',
  ];

  const occupancies = ['Student', 'Faculty', 'Staff'];
  const floors = ['17th Floor', '18th Floor', '19th Floor', '20th Floor'];
  const locations = ['Room', 'Hallway', 'Bathroom', 'Fire Exit', 'Lobby', 'Other'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  // ✅ Start the webcam
  const startCamera = async () => {
  try {
    console.log("Requesting camera...");
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    setIsCameraActive(true);
  } catch (err) {
    console.error("Camera Error:", err.name, err.message);
    if (err.name === "NotAllowedError") {
      alert("Camera permission is blocked. Please allow it in your browser settings.");
    } else if (err.name === "NotFoundError") {
      alert("No camera found. Please connect one and try again.");
    } else if (err.name === "NotReadableError") {
      alert("Camera is in use by another app. Close Zoom or Meet and retry.");
    } else {
      alert("Camera access denied or unavailable.");
    }
  }
};

  // ✅ Capture a photo from the webcam
  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const photoData = canvas.toDataURL('image/png');
    setPhotoPreview(photoData);

    // Stop webcam stream
    const stream = video.srcObject;
    stream.getTracks().forEach((track) => track.stop());
    setIsCameraActive(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.itemName ||
      !formData.category ||
      !formData.occupancy ||
      !formData.floor ||
      !formData.location ||
      !formData.date ||
      !formData.time ||
      !formData.contactNumber ||
      !formData.contactEmail
    ) {
      alert('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contactEmail)) {
      alert('Please enter a valid email address');
      return;
    }

    const phoneRegex = /^[0-9]{10,13}$/;
    if (!phoneRegex.test(formData.contactNumber.replace(/\s/g, ''))) {
      alert('Please enter a valid contact number');
      return;
    }

    console.log('Found Item Report:', { ...formData, photoPreview });
    alert('Your found item report has been submitted successfully!');

    setFormData({
      itemName: '',
      category: '',
      occupancy: '',
      floor: '',
      location: '',
      specificLocation: '',
      date: '',
      time: '',
      description: '',
      contactNumber: '',
      contactEmail: '',
    });
    setPhotoPreview(null);

    navigate('/');
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
          <Button className="found-back-button" onClick={() => navigate('/')}>
            ← Back
          </Button>

          <h5 className="found-form-section-title">Report a Found Item</h5>
          <p className="found-form-subtext">
            Fill out the form below to report your found item.
          </p>

          <Form onSubmit={handleSubmit}>
            <div className="form-grid">
              <Form.Group className="mb-3">
                <Form.Label>Name of the Finder</Form.Label>
                <Form.Control
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>What is your occupation?</Form.Label>
                <Form.Select
                  name="occupancy"
                  value={formData.occupancy}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select your occupancy</option>
                  {occupancies.map((o, i) => (
                    <option key={i}>{o}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>What item did you find?</Form.Label>
                <Form.Control
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Category of your item</Form.Label>
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((c, i) => (
                    <option key={i}>{c}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>What floor did you find the item?</Form.Label>
                <Form.Select
                  name="floor"
                  value={formData.floor}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a floor</option>
                  {floors.map((f, i) => (
                    <option key={i}>{f}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Where did you find the item?</Form.Label>
                <Form.Select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a location</option>
                  {locations.map((l, i) => (
                    <option key={i}>{l}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              {(formData.location === 'Room' ||
                formData.location === 'Other') && (
                <Form.Group className="mb-3">
                  <Form.Label>
                    {formData.location === 'Room'
                      ? 'Please specify the room'
                      : 'Please specify the other'}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="specificLocation"
                    placeholder={
                      formData.location === 'Room'
                        ? 'Enter room number (e.g., Room 1902)'
                        : 'Enter detailed location'
                    }
                    value={formData.specificLocation || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        specificLocation: e.target.value,
                      }))
                    }
                    required
                  />
                </Form.Group>
              )}

              <Form.Group className="mb-3">
                <Form.Label>When did you find it?</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>What time did you find it?</Form.Label>
                <Form.Control
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>What is your contact email?</Form.Label>
                <Form.Control
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>What is your contact number?</Form.Label>
                <Form.Control
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              {/* ✅ Webcam Capture Section */}
              <Form.Group className="mb-3 form-full-width">
                <Form.Label>Take a photo using the webcam</Form.Label>
                <div className="photo-upload-box">
                  {photoPreview ? (
                    <>
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="photo-preview"
                      />
                      <p
                        className="photo-hint"
                        onClick={startCamera}
                        style={{ cursor: 'pointer', color: '#007bff' }}
                      >
                        Click to retake photo
                      </p>
                    </>
                  ) : isCameraActive ? (
                    <>
                      <video ref={videoRef} autoPlay className="photo-video" />
                      <Button
                        variant="primary"
                        onClick={takePhoto}
                        className="mt-2"
                      >
                        Capture Photo
                      </Button>
                    </>
                  ) : (
                    <div onClick={startCamera}>
                      <div className="photo-icon">📷</div>
                      <p className="photo-text">Click to open camera</p>
                    </div>
                  )}
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>
                <Form.Text className="hint-text">
                  Max 16MB. JPG/PNG allowed.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3 form-full-width">
                <Form.Label>Describe the item (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </Form.Group>
            </div>

            <Button type="submit" className="found-submit-button">
              Submit Report
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default FoundItemForm;
