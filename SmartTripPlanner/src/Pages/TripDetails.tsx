import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface Trip {
  _id: string;
  destination: string;
  createdAt: string;
  days: {
    dayNumber: number;
    date: string;
    description: string;
    activities: {
      title: string;
      description: string;
      imageUrl?: string;
      category?: string;
      cost?: string;
    }[];
  }[];
}

interface Alert {
  dayNumber: number;
  placeTitle: string;
  reason: string;
  severity: "warning" | "critical";
}

interface CostEstimate {
  accommodation: number;
  activities: number;
  transportation: number;
  food: number;
  total: number;
}

interface DestinationCosts {
  accommodation: number;
  food: number;
  transportation: number;
  activity: number;
  multiplier: number;
}

export default function TripDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const trip = location.state?.trip as Trip;
  const contentRef = useRef<HTMLDivElement>(null);

  if (!trip) {
    navigate("/profile");
    return null;
  }

  const [editableTrip, setEditableTrip] = useState<Trip>(trip);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [costEstimate, setCostEstimate] = useState<CostEstimate | null>(null);
  const [currency, setCurrency] = useState<"USD" | "INR">("USD");
  const [destinationCosts, setDestinationCosts] = useState<DestinationCosts | null>(null);
  const [isLoadingCosts, setIsLoadingCosts] = useState(true);

  // Static exchange rate (as of March 24, 2025, approx value; use an API for real-time rates)
  const USD_TO_INR = 83.5;

  // Fetch destination costs, alerts, and calculate cost estimate on mount
  useEffect(() => {
    fetchDestinationCosts();
    fetchAlerts();
  }, [editableTrip.destination]);

  // Recalculate costs when destination costs are loaded or trip is edited
  useEffect(() => {
    if (destinationCosts) {
      calculateCostEstimate();
    }
  }, [destinationCosts, editableTrip, currency]);

  // Fetch destination costs from the database
  const fetchDestinationCosts = async () => {
    setIsLoadingCosts(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/destination-costs/${encodeURIComponent(editableTrip.destination)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 && response.data) {
        setDestinationCosts(response.data);
      } else {
        // Fallback to default costs if destination not found in database
        console.warn(`No costs found for ${editableTrip.destination}, using default values`);
        setDestinationCosts({
          accommodation: 100,
          food: 50,
          transportation: 30,
          activity: 25,
          multiplier: 1.0
        });
      }
    } catch (error) {
      console.error("Error fetching destination costs:", error);
      // Fallback to default costs on error
      setDestinationCosts({
        accommodation: 100,
        food: 50,
        transportation: 30,
        activity: 25,
        multiplier: 1.0
      });
      toast.error("Failed to fetch destination costs. Using default values.");
    } finally {
      setIsLoadingCosts(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/alerts/${encodeURIComponent(editableTrip.destination)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 && response.data) {
        setAlerts(response.data);
      } else {
        // Fallback to mock alerts if none found in database
        const mockAlerts: Alert[] = [
          {
            dayNumber: 2,
            placeTitle: "Grand Museum",
            reason: "Temporary closure due to renovation",
            severity: "warning"
          },
          {
            dayNumber: 3,
            placeTitle: "Mountain Trail",
            reason: "Closed due to landslide risk",
            severity: "critical"
          }
        ];
        setAlerts(mockAlerts);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
      // Fallback to empty alerts on error
      setAlerts([]);
    }
  };

  // Calculate cost estimate based on destination costs from the database
  const calculateCostEstimate = () => {
    if (!destinationCosts) return;

    const days = editableTrip.days.length;

    // Count activities by category to apply specific pricing
    const activityCategories = {
      attraction: 0,
      food: 0,
      entertainment: 0,
      transport: 0
    };

    // Calculate activity counts by category
    editableTrip.days.forEach(day => {
      day.activities.forEach(activity => {
        if (activity.category) {
          // @ts-ignore - Dynamic property access
          if (activityCategories[activity.category] !== undefined) {
            // @ts-ignore - Dynamic property access
            activityCategories[activity.category]++;
          } else {
            // Default to 'attraction' if category not recognized
            activityCategories.attraction++;
          }
        } else {
          // Default to 'attraction' if no category
          activityCategories.attraction++;
        }
      });
    });

    // Calculate total activities
    const totalActivities = editableTrip.days.reduce((sum, day) => sum + day.activities.length, 0);

    // Initialize estimate with costs from database
    let estimate: CostEstimate = {
      accommodation: destinationCosts.accommodation * days,
      food: destinationCosts.food * days,
      transportation: destinationCosts.transportation * days,
      activities: destinationCosts.activity * totalActivities,
      total: 0
    };

    // Apply any activity-specific pricing from DB
    // This would be expanded with actual logic based on your database schema

    // Calculate total
    estimate.total = estimate.accommodation + estimate.food + estimate.transportation + estimate.activities;

    // Apply destination multiplier from database
    const multiplier = destinationCosts.multiplier || 1.0;
    estimate.total = Math.round(estimate.total * multiplier);
    estimate.accommodation = Math.round(estimate.accommodation * multiplier);
    estimate.food = Math.round(estimate.food * multiplier);
    estimate.transportation = Math.round(estimate.transportation * multiplier);
    estimate.activities = Math.round(estimate.activities * multiplier);

    // Convert to INR if selected
    if (currency === "INR") {
      estimate = {
        accommodation: Math.round(estimate.accommodation * USD_TO_INR),
        activities: Math.round(estimate.activities * USD_TO_INR),
        transportation: Math.round(estimate.transportation * USD_TO_INR),
        food: Math.round(estimate.food * USD_TO_INR),
        total: Math.round(estimate.total * USD_TO_INR),
      };
    }

    setCostEstimate(estimate);
  };

  const handleInputChange = (dayIndex: number, field: string, value: string) => {
    const updatedDays = [...editableTrip.days];
    updatedDays[dayIndex] = { ...updatedDays[dayIndex], [field]: value };
    setEditableTrip({ ...editableTrip, days: updatedDays });
  };

  const handleActivityChange = (
    dayIndex: number,
    activityIndex: number,
    field: string,
    value: string
  ) => {
    const updatedDays = [...editableTrip.days];
    const updatedActivities = [...updatedDays[dayIndex].activities];
    updatedActivities[activityIndex] = {
      ...updatedActivities[activityIndex],
      [field]: value,
    };
    updatedDays[dayIndex].activities = updatedActivities;
    setEditableTrip({ ...editableTrip, days: updatedDays });
  };

  const addActivity = (dayIndex: number) => {
    const updatedDays = [...editableTrip.days];
    updatedDays[dayIndex].activities.push({
      title: "New Activity",
      description: "Add description here",
      category: "attraction"
    });
    setEditableTrip({ ...editableTrip, days: updatedDays });
  };

  const removeActivity = (dayIndex: number, activityIndex: number) => {
    if (!window.confirm("Are you sure you want to delete this activity?")) return;
    const updatedDays = [...editableTrip.days];
    updatedDays[dayIndex].activities.splice(activityIndex, 1);
    setEditableTrip({ ...editableTrip, days: updatedDays });
  };

  const saveChanges = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/itineraries/${editableTrip._id}`,
        editableTrip,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status !== 200) throw new Error("Failed to save changes");
      toast.success("Changes saved successfully!");
      navigate("/profile");
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTrip = async () => {
    setIsDeleting(true);
    const token = localStorage.getItem("token");
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/itineraries/${editableTrip._id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status !== 200) throw new Error("Failed to delete trip");
      toast.success("Trip deleted successfully!");
      navigate("/profile");
    } catch (error) {
      console.error("Error deleting trip:", error);
      toast.error("Failed to delete trip. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Export itinerary to PDF
  const exportToPDF = async () => {
    if (!contentRef.current) return;
  
    setIsExporting(true);
    try {
      const exportElement = document.createElement('div');
      exportElement.className = 'pdf-export p-8';
      exportElement.style.background = '#f0f4f8'; // Soft background
      exportElement.style.padding = '30px';
      exportElement.style.width = '210mm';
      exportElement.style.color = '#333';
      exportElement.style.fontFamily = 'Arial, sans-serif';
  
      // Title
      const title = document.createElement('h1');
      title.style.fontSize = '32px';
      title.style.color = '#2b6cb0'; // Dark blue
      title.style.textAlign = 'center';
      title.style.marginBottom = '30px';
      title.textContent = `${editableTrip.destination} Itinerary`;
      exportElement.appendChild(title);
  
      // Section Divider
      const divider = document.createElement('hr');
      divider.style.border = 'none';
      divider.style.borderTop = '2px solid #2b6cb0';
      divider.style.marginBottom = '20px';
      exportElement.appendChild(divider);
  
      // Trip Summary
      const summary = document.createElement('div');
      summary.style.background = '#ffffff';
      summary.style.padding = '20px';
      summary.style.borderRadius = '10px';
      summary.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
      summary.style.marginBottom = '30px';
      summary.innerHTML = `
        <h2 style="color: #2f855a;">Trip Summary</h2>
        <p><strong>Destination:</strong> ${editableTrip.destination}</p>
        <p><strong>Duration:</strong> ${editableTrip.days.length} days</p>
        <p><strong>Start Date:</strong> ${editableTrip.days[0]?.date ? new Date(editableTrip.days[0].date).toLocaleDateString() : "Not set"}</p>
        <p><strong>End Date:</strong> ${editableTrip.days[editableTrip.days.length - 1]?.date ? new Date(editableTrip.days[editableTrip.days.length - 1].date).toLocaleDateString() : "Not set"}</p>
        <p><strong>Total Activities:</strong> ${editableTrip.days.reduce((total, day) => total + day.activities.length, 0)}</p>
      `;
      exportElement.appendChild(summary);
  
      // Cost Estimate
      if (costEstimate) {
        const costSection = document.createElement('div');
        costSection.style.background = '#e6fffa'; // Light teal
        costSection.style.padding = '20px';
        costSection.style.borderRadius = '10px';
        costSection.style.marginBottom = '30px';
        costSection.innerHTML = `
          <h2 style="color: #3182ce;">Cost Estimate</h2>
          <p><strong>Accommodation:</strong> ${currency === "USD" ? "$" : "₹"}${costEstimate.accommodation}</p>
          <p><strong>Activities:</strong> ${currency === "USD" ? "$" : "₹"}${costEstimate.activities}</p>
          <p><strong>Transportation:</strong> ${currency === "USD" ? "$" : "₹"}${costEstimate.transportation}</p>
          <p><strong>Food:</strong> ${currency === "USD" ? "$" : "₹"}${costEstimate.food}</p>
          <p style="font-size: 18px; font-weight: bold; color: #2f855a;"><strong>Total:</strong> ${currency === "USD" ? "$" : "₹"}${costEstimate.total}</p>
          <small>*Note: This is an estimate based on current rates for ${editableTrip.destination}. Costs may vary.</small>
        `;
        exportElement.appendChild(costSection);
      }
  
      // Alerts Section
      if (alerts.length > 0) {
        const alertsSection = document.createElement('div');
        alertsSection.style.background = '#fff5f5'; // Very light red
        alertsSection.style.padding = '20px';
        alertsSection.style.borderRadius = '10px';
        alertsSection.style.marginBottom = '30px';
        alertsSection.innerHTML = `<h2 style="color: #e53e3e;">Trip Alerts</h2>`;
  
        alerts.forEach(alert => {
          const alertDiv = document.createElement('div');
          alertDiv.style.border = `2px solid ${alert.severity === 'critical' ? '#e53e3e' : '#ecc94b'}`;
          alertDiv.style.padding = '15px';
          alertDiv.style.marginTop = '10px';
          alertDiv.style.borderRadius = '8px';
          alertDiv.innerHTML = `
            <strong>Day ${alert.dayNumber}: ${alert.placeTitle}</strong>
            <p>${alert.reason}</p>
          `;
          alertsSection.appendChild(alertDiv);
        });
  
        exportElement.appendChild(alertsSection);
      }
  
      // Daily Itinerary
      const daysSection = document.createElement('div');
      daysSection.innerHTML = `<h2 style="color: #805ad5;">Daily Itinerary</h2>`;
      exportElement.appendChild(daysSection);
  
      editableTrip.days.forEach((day) => {
        const dayDiv = document.createElement('div');
        dayDiv.style.background = '#ffffff';
        dayDiv.style.padding = '20px';
        dayDiv.style.marginTop = '20px';
        dayDiv.style.borderRadius = '10px';
        dayDiv.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
  
        dayDiv.innerHTML = `
          <h3 style="color: #2b6cb0;">Day ${day.dayNumber} - ${day.date ? new Date(day.date).toLocaleDateString() : "Date not set"}</h3>
          <p style="font-style: italic;">${day.description || 'No description provided.'}</p>
        `;
  
        if (day.activities.length > 0) {
          const activitiesList = document.createElement('ul');
          activitiesList.style.paddingLeft = '20px';
          activitiesList.style.marginTop = '10px';
          
          day.activities.forEach(activity => {
            const activityItem = document.createElement('li');
            activityItem.style.marginBottom = '10px';
            activityItem.innerHTML = `
              <strong>${activity.title}</strong> ${activity.cost ? `(${activity.cost})` : ''}
              <p>${activity.description}</p>
              ${activity.category ? `<small style="color: #4a5568;">Category: ${activity.category}</small>` : ''}
            `;
            activitiesList.appendChild(activityItem);
          });
  
          dayDiv.appendChild(activitiesList);
        } else {
          const noActivities = document.createElement('p');
          noActivities.style.fontStyle = 'italic';
          noActivities.textContent = 'No activities planned for this day.';
          dayDiv.appendChild(noActivities);
        }
  
        daysSection.appendChild(dayDiv);
      });
  
      // Footer
      const footer = document.createElement('div');
      footer.style.marginTop = '40px';
      footer.style.textAlign = 'center';
      footer.style.color = '#718096';
      footer.style.fontSize = '12px';
      footer.innerHTML = `<p>Generated on ${new Date().toLocaleDateString()}</p>`;
      exportElement.appendChild(footer);
  
      // Append to body temporarily
      document.body.appendChild(exportElement);
  
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const canvasElement = await html2canvas(exportElement, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#FFFFFF'
      });
  
      const imgData = canvasElement.toDataURL('image/png');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = canvasElement.height * imgWidth / canvasElement.width;
      let heightLeft = imgHeight;
      let position = 0;
  
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
  
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
  
      pdf.save(`${editableTrip.destination.replace(/\s+/g, '_')}_Itinerary.pdf`);
  
      document.body.removeChild(exportElement);
  
      toast.success('Itinerary exported beautifully as PDF! 🎉');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Failed to export itinerary. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };
  

  // Print itinerary
  const printItinerary = () => {
    if (!contentRef.current) return;
    
    // Create a new printable div with better formatting
    const printableContent = document.createElement('div');
    printableContent.className = 'print-content';
    printableContent.style.fontFamily = 'Arial, sans-serif';
    printableContent.style.color = '#000';
    printableContent.style.backgroundColor = '#fff';
    printableContent.style.padding = '20px';
    
    // Create a title
    const title = document.createElement('h1');
    title.style.fontSize = '24px';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '20px';
    title.style.textAlign = 'center';
    title.textContent = `${editableTrip.destination} Itinerary`;
    printableContent.appendChild(title);
    
    // Add trip summary
    const summary = document.createElement('div');
    summary.style.marginBottom = '30px';
    summary.innerHTML = `
      <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">Trip Summary</h2>
      <p><strong>Destination:</strong> ${editableTrip.destination}</p>
      <p><strong>Duration:</strong> ${editableTrip.days.length} days</p>
      <p><strong>Start Date:</strong> ${editableTrip.days[0]?.date ? new Date(editableTrip.days[0].date).toLocaleDateString() : "Not set"}</p>
      <p><strong>End Date:</strong> ${editableTrip.days[editableTrip.days.length - 1]?.date ? new Date(editableTrip.days[editableTrip.days.length - 1].date).toLocaleDateString() : "Not set"}</p>
    `;
    printableContent.appendChild(summary);
    
    // Add cost estimate if available
    if (costEstimate) {
      const costSection = document.createElement('div');
      costSection.style.marginBottom = '30px';
      costSection.innerHTML = `
        <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">Cost Estimate</h2>
        <p><strong>Accommodation:</strong> ${currency === "USD" ? "$" : "₹"}${costEstimate.accommodation}</p>
        <p><strong>Activities:</strong> ${currency === "USD" ? "$" : "₹"}${costEstimate.activities}</p>
        <p><strong>Transportation:</strong> ${currency === "USD" ? "$" : "₹"}${costEstimate.transportation}</p>
        <p><strong>Food:</strong> ${currency === "USD" ? "$" : "₹"}${costEstimate.food}</p>
        <p style="font-weight: bold;"><strong>Total Estimated Cost:</strong> ${currency === "USD" ? "$" : "₹"}${costEstimate.total}</p>
      `;
      printableContent.appendChild(costSection);
    }
    
    // Add daily itinerary details
    const daysSection = document.createElement('div');
    daysSection.innerHTML = `<h2 style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">Daily Itinerary</h2>`;
    
    editableTrip.days.forEach((day, index) => {
      const dayDiv = document.createElement('div');
      dayDiv.style.marginBottom = '30px';
      dayDiv.style.pageBreakInside = 'avoid';
      
      dayDiv.innerHTML = `
        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 5px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
          Day ${day.dayNumber} - ${day.date ? new Date(day.date).toLocaleDateString() : "Date not set"}
        </h3>
        <p style="margin-bottom: 15px;">${day.description}</p>
      `;
      
      if (day.activities.length > 0) {
        const activitiesList = document.createElement('div');
        activitiesList.style.paddingLeft = '15px';
        
        day.activities.forEach((activity, actIndex) => {
          const activityDiv = document.createElement('div');
          activityDiv.style.marginBottom = '15px';
          activityDiv.innerHTML = `
            <h4 style="font-size: 14px; font-weight: bold;">${activity.title} ${activity.cost ? `(${activity.cost})` : ''}</h4>
            <p>${activity.description}</p>
            ${activity.category ? `<p><strong>Category:</strong> ${activity.category}</p>` : ''}
          `;
          activitiesList.appendChild(activityDiv);
        });
        
        dayDiv.appendChild(activitiesList);
      } else {
        const noActivities = document.createElement('p');
        noActivities.style.fontStyle = 'italic';
        noActivities.textContent = 'No activities planned for this day.';
        dayDiv.appendChild(noActivities);
      }
      
      daysSection.appendChild(dayDiv);
    });
    
    printableContent.appendChild(daysSection);
    
    // Add alerts if any
    if (alerts.length > 0) {
      const alertsSection = document.createElement('div');
      alertsSection.style.marginBottom = '30px';
      alertsSection.style.pageBreakBefore = 'always';
      alertsSection.innerHTML = `<h2 style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">Trip Alerts</h2>`;
      
      alerts.forEach(alert => {
        const alertDiv = document.createElement('div');
        alertDiv.style.border = '1px solid #ccc';
        alertDiv.style.borderLeft = alert.severity === 'critical' ? '4px solid #e53e3e' : '4px solid #ecc94b';
        alertDiv.style.padding = '10px';
        alertDiv.style.marginBottom = '10px';
        alertDiv.style.borderRadius = '4px';
        alertDiv.innerHTML = `
          <p><strong>Day ${alert.dayNumber}: ${alert.placeTitle}</strong></p>
          <p>${alert.reason}</p>
        `;
        alertsSection.appendChild(alertDiv);
      });
      
      printableContent.appendChild(alertsSection);
    }
    
    // Add footer
    const footer = document.createElement('div');
    footer.style.marginTop = '30px';
    footer.style.textAlign = 'center';
    footer.style.fontSize = '12px';
    footer.style.color = '#666';
    footer.innerHTML = `
      <p>Printed on ${new Date().toLocaleDateString()}</p>
    `;
    printableContent.appendChild(footer);
    
    // Create print-specific styles
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        .print-content, .print-content * {
          visibility: visible;
        }
        .print-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        @page {
          size: A4;
          margin: 20mm;
        }
        h3 {
          page-break-after: avoid;
        }
        h4 {
          page-break-after: avoid;
        }
      }
    `;
    
    // Append to document
    document.body.appendChild(style);
    document.body.appendChild(printableContent);
    
    // Trigger print dialog
    window.print();
    
    // Clean up
    document.body.removeChild(style);
    document.body.removeChild(printableContent);
    
    toast.success('Print dialog opened!');
  };

  const [earthquakes, setEarthquakes] = useState<any[]>([]);

  useEffect(() => {
    fetchEarthquakes();
  }, [editableTrip]);

  const fetchEarthquakes = async () => {
    try {
      const response = await fetch(
        `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2025-03-01&endtime=2025-03-24`
      );

      if (!response.ok) throw new Error("Failed to fetch earthquake data");

      const data = await response.json();
      const filteredQuakes: { properties: { place: string } }[] = data.features.filter((quake: { properties: { place: string } }) =>
        quake.properties.place.includes(editableTrip.destination)
      );

      setEarthquakes(filteredQuakes);
    } catch (error) {
      console.error("Error fetching earthquake data:", error);
    }
  };

  // Toggle currency and recalculate
  const toggleCurrency = () => {
    setCurrency(currency === "USD" ? "INR" : "USD");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto p-4 text-black dark:text-white">
      <div className="lg:w-2/3 space-y-6" ref={contentRef}>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            <input
              type="text"
              value={editableTrip.destination}
              onChange={(e) => {
                setEditableTrip({ ...editableTrip, destination: e.target.value });
              }}
              className="bg-transparent border-b border-gray-300 focus:outline-none focus:border-primary px-2"
            />
          </h1>
          <div className="flex gap-2">
            <button
              onClick={saveChanges}
              disabled={isSaving}
              className="bg-primary dark:bg- text-white px-4 py-2 rounded-md hover:bg-primary-dark disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <div className="grid grid-cols-1 gap-4 pt-1">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:opacity-50"
                  >
                    Delete Trip
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. All your data, including saved trips, will be permanently deleted.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600"
                      onClick={deleteTrip}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <p className="text-gray-500 mb-4">
            Created on: {new Date(editableTrip.createdAt).toDateString()}
          </p>

          <div className="flex overflow-x-auto mb-4 border-b">
            {editableTrip.days.map((day, index) => (
              <button
                key={day.dayNumber}
                onClick={() => setActiveTab(index)}
                className={`px-4 py-2 font-medium whitespace-nowrap ${
                  activeTab === index
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Day {day.dayNumber}
                {alerts.some(alert => alert.dayNumber === day.dayNumber) && (
                  <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {editableTrip.days[activeTab] && (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                  <h2 className="text-xl font-semibold">
                    Day {editableTrip.days[activeTab].dayNumber}
                  </h2>
                  <input
                    type="date"
                    value={editableTrip.days[activeTab].date}
                    onChange={(e) => handleInputChange(activeTab, "date", e.target.value)}
                    className="bg-transparent border rounded border-gray-300 focus:outline-none focus:border-primary p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Day Description</label>
                  <textarea
                    value={editableTrip.days[activeTab].description}
                    onChange={(e) => handleInputChange(activeTab, "description", e.target.value)}
                    rows={3}
                    className="bg-transparent border rounded border-gray-300 focus:outline-none focus:border-primary w-full p-2"
                  />
                </div>

                <div className="space-y-4 mt-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Activities</h3>
                    <button
                      onClick={() => addActivity(activeTab)}
                      className="text-primary hover:text-primary-dark text-sm flex items-center"
                    >
                      <span className="mr-1">+</span> Add Activity
                    </button>
                  </div>

                  {editableTrip.days[activeTab].activities.map((activity, activityIndex) => (
                    <div
                      key={activityIndex}
                      className="border p-4 rounded-md bg-gray-50 dark:bg-gray-700 relative"
                    >
                      <button
                        onClick={() => removeActivity(activeTab, activityIndex)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>

                      <div className="mb-2">
                        <label className="block text-sm font-medium mb-1">Activity Title</label>
                        <input
                          type="text"
                          value={activity.title}
                          onChange={(e) =>
                            handleActivityChange(activeTab, activityIndex, "title", e.target.value)
                          }
                          className="bg-transparent border rounded border-gray-300 focus:outline-none focus:border-primary w-full p-2"
                        />
                      </div>

                      <div className="mb-2">
                        <label className="block text-sm font-medium mb-1">Activity Description</label>
                        <textarea
                          value={activity.description}
                          onChange={(e) =>
                            handleActivityChange(activeTab, activityIndex, "description", e.target.value)
                          }
                          rows={2}
                          className="bg-transparent border rounded border-gray-300 focus:outline-none focus:border-primary w-full p-2"
                        />
                      </div>

                      <div className="flex gap-4 mb-2">
                        <div className="w-1/2">
                          <label className="block text-sm font-medium mb-1">Category</label>
                          <select
                            value={activity.category || "attraction"}
                            onChange={(e) =>
                              handleActivityChange(activeTab, activityIndex, "category", e.target.value)
                            }
                            className="bg-transparent border rounded border-gray-300 focus:outline-none focus:border-primary w-full p-2"
                          >
                            <option value="attraction">Attraction</option>
                            <option value="food">Food</option>
                            <option value="transport">Transportation</option>
                            <option value="entertainment">Entertainment</option>
                            <option value="accommodation">Accommodation</option>
                          </select>
                        </div>
                        <div className="w-1/2">
                          <label className="block text-sm font-medium mb-1">Cost Category</label>
                          <select
                            value={activity.cost || "$"}
                            onChange={(e) =>
                              handleActivityChange(activeTab, activityIndex, "cost", e.target.value)
                            }
                            className="bg-transparent border rounded border-gray-300 focus:outline-none focus:border-primary w-full p-2"
                          >
                            <option value="$">$ (Budget)</option>
                            <option value="$$">$$ (Mid-Range)</option>
                            <option value="$$$">$$$ (Luxury)</option>
                          </select>
                        </div>
                      </div>

                      {activity.imageUrl && (
                        <div className="mt-3">
                          <img
                            src={activity.imageUrl}
                            alt={activity.title}
                            className="h-40 w-full object-cover rounded-md"
                          />
                        </div>
                      )}

                      {alerts.some(
                        alert =>
                          alert.dayNumber === editableTrip.days[activeTab].dayNumber &&
                          alert.placeTitle === activity.title
                      ) && (
                        <div className="mt-3 p-2 bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded text-red-700 dark:text-red-200 text-sm">
                          ⚠️ This activity may be affected by closures or restrictions
                        </div>
                      )}
                    </div>
                  ))}

                  {editableTrip.days[activeTab].activities.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      No activities yet. Click "Add Activity" to get started.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Earthquake Alerts</h2>

            {earthquakes.length > 0 ? (
              <div className="space-y-4">
                {earthquakes.map((quake, index) => {
                  const { place, mag, time } = quake.properties;
                  return (
                    <div key={index} className="p-3 rounded-md bg-red-100 dark:bg-red-900 border-l-4 border-red-500">
                      <h3 className="font-medium">🌍 {place}</h3>
                      <p>Magnitude: {mag}</p>
                      <p>Date: {new Date(time).toDateString()}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">No recent earthquakes reported.</p>
            )}
          </div>
        </div>
      </div>

      <div className="lg:w-1/3 space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Trip Alerts</h2>
          {alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-md ${
                    alert.severity === "critical"
                      ? "bg-red-100 dark:bg-red-900 border-l-4 border-red-500"
                      : "bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500"
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-2">
                      {alert.severity === "critical" ? "🚫" : "⚠️"}
                    </div>
                    <div>
                      <h3 className="font-medium">
                        Day {alert.dayNumber}: {alert.placeTitle}
                      </h3>
                      <p className="text-sm mt-1">{alert.reason}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No alerts for this trip at the moment.
            </div>
          )}
        </div>

        {/* <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Cost Estimate</h2>
            <button
              onClick={toggleCurrency}
              className="text-sm text-primary hover:text-primary-dark"
            >
              Switch to {currency === "USD" ? "INR" : "USD"}
            </button>
          </div>
          {isLoadingCosts ? (
            <div className="text-center py-6 text-gray-500">
              Loading cost data...
            </div>
          ) : costEstimate ? (
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Accommodation:</span>
                <span className="font-medium">{currency === "USD" ? "$" : "₹"}{costEstimate.accommodation}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Activities:</span>
                <span className="font-medium">{currency === "USD" ? "$" : "₹"}{costEstimate.activities}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Transportation:</span>
                <span className="font-medium">{currency === "USD" ? "$" : "₹"}{costEstimate.transportation}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Food:</span>
                <span className="font-medium">{currency === "USD" ? "$" : "₹"}{costEstimate.food}</span>
              </li>
              <li className="flex justify-between border-t pt-2">
                <span className="font-semibold">Total Estimated Cost:</span>
                <span className="font-semibold">{currency === "USD" ? "$" : "₹"}{costEstimate.total}</span>
              </li>
            </ul>
          ) : (
            <div className="text-center py-6 text-gray-500">
              Calculating cost estimate...
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            *Note: This is an estimate based on current rates for {editableTrip.destination}.
            Actual costs may vary based on seasonality and specific choices.
            {currency === "INR" && " Exchange rate used: 1 USD = 83.5 INR."}
          </p>
        </div> */}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Trip Summary</h2>
          <ul className="space-y-2">
            <li className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Destination:</span>
              <span className="font-medium">{editableTrip.destination}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Duration:</span>
              <span className="font-medium">{editableTrip.days.length} days</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Start Date:</span>
              <span className="font-medium">
                {editableTrip.days[0]?.date ? new Date(editableTrip.days[0].date).toLocaleDateString() : "Not set"}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">End Date:</span>
              <span className="font-medium">
                {editableTrip.days[editableTrip.days.length - 1]?.date
                  ? new Date(editableTrip.days[editableTrip.days.length - 1].date).toLocaleDateString()
                  : "Not set"}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Activities:</span>
              <span className="font-medium">
                {editableTrip.days.reduce((total, day) => total + day.activities.length, 0)}
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Trip Actions</h2>
          <div className="space-y-2">
            <button 
              onClick={exportToPDF}
              disabled={isExporting}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center"
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Exporting...
                </>
              ) : (
                <>Export Itinerary</>
              )}
            </button>
            <button className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
              Share Trip
            </button>
            <button 
              onClick={printItinerary}
              className="w-full bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600"
            >
              Print Itinerary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}