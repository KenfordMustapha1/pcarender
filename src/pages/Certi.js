// Certi.js
import React, { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './Certificate.css'; // You can style this however you like

const Certi = () => {
  const [showModal, setShowModal] = useState(false);
  const certiRef = useRef(null);

  const handleDownload = () => {
    const input = certiRef.current;
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('certificate.pdf');
    });
  };

  return (
    <div>
      {/* Certificate Card */}
      <div className="certi-card" onClick={() => setShowModal(true)}>
        <div className="certi-header">Certificate</div>
        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="Certificate"
          className="certi-icon"
        />
        <p className="course-label">COURSE</p>
        <h2 className="course-title">Ethical Hacker</h2>
        <p className="issued-date">Issued On: <strong>May 27, 2025</strong></p>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Certificate Preview</h2>
            <div className="certificate-preview" ref={certiRef}>
              <h1>Certificate of Katangahan</h1>
              <p>This certifies that show completion of ethical hacker</p>
              <h2>Cedrix Ian F. Nocum</h2>
              <p>has successfully completed the course</p>
              <h3>Ethical Hacker</h3>
              <p>Issued on: May 01, 2025</p>
            </div>
            <div className="modal-buttons">
              <button onClick={handleDownload}>Download</button>
              <button onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certi;
