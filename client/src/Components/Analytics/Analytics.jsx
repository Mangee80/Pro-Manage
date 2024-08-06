import {React, useState, useEffect} from 'react';
import './Analytics.css'; // Import CSS file for styling
import { GoDotFill } from "react-icons/go";
{/* <div className="analytics-field">Backlog Tasks:</div>
    <div className="analytics-data">{analyticsData.backlogTasks}</div> 
    <div className="analytics-field">To-do Tasks:</div>
    <div className="analytics-data">{analyticsData.todoTasks}</div> 
    <div className="analytics-field">In-Progress Tasks:</div>
    <div className="analytics-data">{analyticsData.inProgressTasks}</div>
    <div className="analytics-field">Completed Tasks:</div>
    <div className="analytics-data">{analyticsData.completedTasks}</div>  
*/}

const AnalyticsTable = ({ analyticsData }) => {
  return (
    <div className="analytics-container">
      <div>
        {/* <div style={{display: 'flex'}}>
          <div><GoDotFill color='blue' size={20}/></div>
          <div>Backlog Tasks:</div>
          <div>{analyticsData.backlogTasks}</div>
        </div> */}
        <div style={{ display: 'flex', alignItems: 'center'}}>
          <div style={{ display: 'flex', alignItems: 'center', marginRight: '100px' }}>
            <GoDotFill color='blue' size={20} />
            <div style={{ marginLeft: '0.5rem' }}>Backlog Tasks:</div>
          </div>
          <div>{analyticsData.backlogTasks}</div>
        </div>

        <div style={{ display: 'flex', marginTop: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginRight: '100px' }}>
            <GoDotFill color='blue' size={20} />
            <div style={{ marginLeft: '0.5rem' }}>To-do Tasks:</div>
          </div>
          <div>{analyticsData.todoTasks}</div>
        </div>

        <div style={{ display: 'flex', marginTop: '1rem', alignItems: 'center'}}>
          <div style={{ display: 'flex', alignItems: 'center', marginRight: '100px' }}>
            <GoDotFill color='blue' size={20} />
            <div style={{ marginLeft: '0.5rem' }}>In-Progress Tasks:</div>
          </div>
          <div>{analyticsData.inProgressTasks}</div>
        </div>

        <div style={{ display: 'flex', marginTop: '1rem', alignItems: 'center'}}>
          <div style={{ display: 'flex', alignItems: 'center', marginRight: '100px' }}>
            <GoDotFill color='blue' size={20} />
            <div style={{ marginLeft: '0.5rem' }}>Completed Tasks:</div>
          </div>
          <div>{analyticsData.completedTasks}</div>
        </div>

      </div> 
      {/* Right side pairs
      <div className="analytics-right">
        <div className="analytics-pair">
          <div className="dot"></div>
          <div className="analytics-info">
            <div className="analytics-field">Low Priority Tasks:</div>
            <div className="analytics-data">{analyticsData.lowPriorityTasks}</div>
          </div>
        </div>
        <div className="analytics-pair">
          <div className="dot"></div>
          <div className="analytics-info">
            <div className="analytics-field">Moderate Priority Tasks:</div>
            <div className="analytics-data">{analyticsData.moderatePriorityTasks}</div>
          </div>
        </div>
        <div className="analytics-pair">
          <div className="dot"></div>
          <div className="analytics-info">
            <div className="analytics-field">High Priority Tasks:</div>
            <div className="analytics-data">{analyticsData.highPriorityTasks}</div>
          </div>
        </div>
        <div className="analytics-pair">
          <div className="dot"></div>
          <div className="analytics-info">
            <div className="analytics-field">Due Date Tasks:</div>
            <div className="analytics-data">{analyticsData.dueDateTasks}</div>
          </div>
        </div>
      </div> */}
    </div>
  );
};





const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    // Fetch analytics data when the component mounts
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      // Retrieve userID from localStorage or wherever it's stored
      const userID = localStorage.getItem('userID');
      console.log(userID)
      const response = await fetch(`https://pro-manage-one.vercel.app/api/card/analytics?userID=${userID}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      console.log(response)
      const data = await response.json();
      console.log(data)
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    }
  };

  return (
    <div>
      <p style={{ fontSize: '17px', fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', margin: '5vh'}}>Analytics</p>
      {analyticsData && <AnalyticsTable analyticsData={analyticsData} />}
    </div>
  );
};

export default Analytics;
