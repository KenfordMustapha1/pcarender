import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import './Report.css';

// Register ChartJS components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const ReportPage = () => {
  const [summary, setSummary] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
  });
  const [barChartData, setBarChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Applications',
        data: [],
        backgroundColor: '#3B82F6',
      },
    ],
  });
  const [pieChartData, setPieChartData] = useState({
    labels: ['Approved', 'Rejected', 'Pending'],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: ['#10B981', '#EF4444', '#FBBF24'],
        hoverBackgroundColor: ['#059669', '#DC2626', '#F59E0B'],
      },
    ],
  });
  const [recentApps, setRecentApps] = useState([]);
  const [acceptedApps, setAcceptedApps] = useState({ simplified: [], fullData: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplications, setSelectedApplications] = useState(new Set());

  // Fetch Data - GET FULL DETAILS
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch summary for overview
        const summaryRes = await axios.get('http://localhost:5000/api/registrations/summary');
        
        // Fetch FULL details for accepted applications to ensure we have all data
        const acceptedIds = summaryRes.data
          .filter(reg => reg.status?.toLowerCase() === 'accepted')
          .map(reg => reg._id);
        
        // Fetch full details for each accepted application
        const fullDetailsPromises = acceptedIds.map(id => 
          axios.get(`http://localhost:5000/api/registrations/${id}`)
        );
        
        const fullDetailsResults = await Promise.all(fullDetailsPromises);
        const fullAcceptedData = fullDetailsResults.map(res => res.data);
        
        processRegistrations(summaryRes.data, fullAcceptedData);
      } catch (err) {
        console.error('Failed to load registrations:', err);
        setError('Could not load registration data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Process Registration Data
  const processRegistrations = (data, fullAcceptedData) => {
    const approved = fullAcceptedData.length;
    const rejected = data.filter((reg) => reg.status?.toLowerCase() === 'rejected').length;
    const pending = data.length - approved - rejected;
    setSummary({ total: data.length, approved, rejected, pending });

    // Monthly Trend
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyCount = {};
    data.forEach((reg) => {
      if (reg.dateRegistration) {
        const date = new Date(reg.dateRegistration);
        const month = date.toLocaleString('default', { month: 'short' });
        monthlyCount[month] = (monthlyCount[month] || 0) + 1;
      }
    });

    const sortedMonths = Object.keys(monthlyCount).sort(
      (a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b)
    );

    setBarChartData({
      labels: sortedMonths,
      datasets: [
        {
          label: 'Applications per Month',
          data: sortedMonths.map((m) => monthlyCount[m]),
          backgroundColor: '#3B82F6',
        },
      ],
    });

    // Recent Applications
    const recent = [...data]
      .sort((a, b) => new Date(b.dateRegistration) - new Date(a.dateRegistration))
      .slice(0, 5)
      .map((reg) => ({
        name: reg.registeredbusinessname || 'Unknown',
        date: reg.dateRegistration ? new Date(reg.dateRegistration).toLocaleDateString() : 'N/A',
        status: reg.status || 'Pending',
      }));
    setRecentApps(recent);

    // Accepted Applications - Use full data
    const formattedAccepted = fullAcceptedData.map((app) => ({
      businessName: app.registeredbusinessname || 'N/A',
      applicationType: app.applicationType || 'N/A',
      date: app.dateRegistration ? new Date(app.dateRegistration).toLocaleDateString() : 'N/A',
    }));
    
    setAcceptedApps({
      simplified: formattedAccepted,
      fullData: fullAcceptedData, // This now contains COMPLETE data
    });

    // Pie Chart
    setPieChartData({
      labels: ['Approved', 'Rejected', 'Pending'],
      datasets: [
        {
          data: [approved, rejected, pending],
          backgroundColor: ['#10B981', '#EF4444', '#FBBF24'],
          hoverBackgroundColor: ['#059669', '#DC2626', '#F59E0B'],
        },
      ],
    });
  };

  // Toggle selection
  const handleCheckboxChange = (index) => {
    const newSelected = new Set(selectedApplications);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedApplications(newSelected);
  };

  // Select/Deselect All
  const handleSelectAll = () => {
    const newSelected = new Set();
    if (selectedApplications.size !== acceptedApps.simplified.length) {
      acceptedApps.simplified.forEach((_, idx) => newSelected.add(idx));
    }
    setSelectedApplications(newSelected);
  };

  // ✅ FIXED Export Function - Better handling of missing data
  const handleExport = () => {
    const selectedIndices = Array.from(selectedApplications);
    if (selectedIndices.length === 0) {
      alert("Please select at least one application to export.");
      return;
    }

    const selectedData = selectedIndices.map((idx) => acceptedApps.fullData[idx]);

    // ✅ Define fields with readable headers
    const fieldMapping = {
      // Application Details
      'applicationType': 'Application Type',
      'previousPcaRegistrationNumber': 'Previous PCA Registration Number',
      'previousOfficialReceiptNumber': 'Previous Official Receipt Number',
      'dateFiling': 'Date of Filing',
      'dateRegistration': 'Date of Registration',
      
      // Business Activity
      'natureofbusiness': 'Nature of Business',
      'pcaNumberActivity': 'Coconut or Oil Palm',
      'farmersormanufacturers': 'Farmer or Manufacturer',
      'fundsource': 'Fund Source',
      'market': 'Market',
      'businesstructure': 'Business Structure',
      
      // Business Profile & Contact
      'registeredbusinessname': 'Registered Business Name',
      'companywebsite': 'Company Website',
      'companyemailaddress': 'Company Email Address',
      'officeaddress': 'Office Address',
      'telno1': 'Telephone Number 1',
      'plantaddress': 'Plant Address',
      'telono2': 'Telephone Number 2',
      'coordinateswaypoints': 'Coordinates/Waypoints',
      'contactperson': 'Contact Person',
      'contactnumber': 'Contact Number',
      'emailaddress': 'Email Address',
      
      // Workforce Distribution
      'totalnumberofemployees': 'Total Number of Employees',
      'regular': 'Regular Employees',
      'nonregularorjoborder': 'Non-Regular/Job Order',
      'seniorcitizen': 'Senior Citizen',
      'pwd': 'PWD',
      'ips': 'IPs',
      'yearestablished': 'Year Established',
      
      // Financial Information
      'tinno': 'TIN Number',
      'vatno': 'VAT Number',
      'authorizedcapitalphp': 'Authorized Capital (PHP)',
      'totalcapitalizationphp': 'Total Capitalization (PHP)',
      'workingcapitalphp': 'Working Capital (PHP)',
      'ownership': 'Ownership',
      'fiscalornonfiscal': 'Fiscal/Non-Fiscal',
      'validityperiod': 'Validity Period',
      
      // Permits/License
      'registrationnumber': 'Registration Number',
      'validityexpirydate': 'Validity/Expiry Date',
      
      // Status
      'status': 'Status'
    };

    const fields = Object.keys(fieldMapping);
    const headers = Object.values(fieldMapping);

    // ✅ Create CSV with proper escaping
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(','));
    
    // Add data rows
    for (const row of selectedData) {
      const values = fields.map((field) => {
        let value = row[field];
        
        // ✅ Handle different data types
        if (value === null || value === undefined) {
          value = '';
        } else if (value instanceof Date) {
          value = value.toLocaleDateString();
        } else if (typeof value === 'object') {
          value = JSON.stringify(value);
        } else {
          value = String(value);
        }
        
        // ✅ Proper CSV escaping
        // If value contains comma, newline, or quote, wrap in quotes
        if (value.includes(',') || value.includes('\n') || value.includes('"')) {
          value = '"' + value.replace(/"/g, '""') + '"';
        }
        
        return value;
      });
      
      csvRows.push(values.join(','));
    }

    // ✅ Create and download file
    const csvString = csvRows.join('\r\n');
    const blob = new Blob(['\ufeff' + csvString], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().split('T')[0];
    
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `PCA_Accepted_Applications_${timestamp}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    // Show success message
    alert(`Successfully exported ${selectedIndices.length} application(s)!`);
  };

  // Chart Options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
    },
  };

  if (loading)
    return (
      <div className="report-container">
        <div className="loading">Loading report data...</div>
      </div>
    );
  if (error)
    return (
      <div className="report-container">
        <div className="error">{error}</div>
      </div>
    );

  return (
    <div className="report-container">
      <h1 className="report-title">PCA Permit Application Report</h1>

      {/* Summary Cards */}
      <div className="summary-cards">
        {[
          { title: 'Total Applications', value: summary.total, color: 'text-blue' },
          { title: 'Approved', value: summary.approved, color: 'text-green' },
          { title: 'Rejected', value: summary.rejected, color: 'text-red' },
          { title: 'Pending', value: summary.pending, color: 'text-yellow' },
        ].map((card, index) => (
          <div key={index} className="summary-card">
            <p>{card.title}</p>
            <h2 className={card.color}>{card.value}</h2>
          </div>
        ))}
      </div>

      {/* Dashboard Layout */}
      <div className="dashboard-container">
        {/* Left Column */}
        <div className="left-column">
          {/* Bar Chart */}
          <div className="chart-container bar-chart">
            <h2 className="chart-title">Monthly Applications</h2>
            <Bar
              data={barChartData}
              options={{ ...chartOptions, plugins: { legend: { display: false } } }}
            />
          </div>

          {/* Accepted Applications Table */}
          <div className="accepted-table-section">
            <div className="table-header">
              <h2 className="table-title">
                Accepted Applications
                {selectedApplications.size > 0 && (
                  <span className="selection-count"> ({selectedApplications.size} selected)</span>
                )}
              </h2>
              <button 
                className="export-button" 
                onClick={handleExport}
                disabled={selectedApplications.size === 0}
              >
                📥 Export Selected
              </button>
            </div>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={
                          selectedApplications.size === acceptedApps.simplified.length &&
                          acceptedApps.simplified.length > 0
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>Business Name</th>
                    <th>Application Type</th>
                    <th>Date of Registration</th>
                  </tr>
                </thead>
                <tbody>
                  {acceptedApps.simplified.length > 0 ? (
                    acceptedApps.simplified.map((app, idx) => (
                      <tr key={idx}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedApplications.has(idx)}
                            onChange={() => handleCheckboxChange(idx)}
                          />
                        </td>
                        <td>{app.businessName}</td>
                        <td>{app.applicationType}</td>
                        <td>{app.date}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No accepted applications found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Widgets */}
        <div className="right-widgets">
          {/* Pie Chart */}
          <div className="chart-container pie-chart">
            <h2 className="chart-title">Application Status</h2>
            <Pie data={pieChartData} options={chartOptions} />
          </div>

          {/* Recent Applications */}
          <div className="table-container">
            <h2 className="table-title">Recent Applications</h2>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Business Name</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApps.length > 0 ? (
                    recentApps.map((app, idx) => (
                      <tr key={idx}>
                        <td>{app.name}</td>
                        <td>{app.date}</td>
                        <td>
                          <span
                            className={`status-badge ${
                              app.status.toLowerCase() === 'accepted'
                                ? 'status-approved'
                                : app.status.toLowerCase() === 'rejected'
                                ? 'status-rejected'
                                : 'status-pending'
                            }`}
                          >
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3">No recent applications found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;