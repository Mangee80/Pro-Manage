import {React, useState, useEffect, useRef} from 'react';
import './Analytics.css';
import { GoDotFill } from "react-icons/go";
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const SummaryCards = ({ analyticsData }) => {
  const totalTasks =
    (analyticsData.backlogTasks || 0) +
    (analyticsData.todoTasks || 0) +
    (analyticsData.inProgressTasks || 0) +
    (analyticsData.completedTasks || 0);
  const pendingTasks =
    (analyticsData.backlogTasks || 0) +
    (analyticsData.todoTasks || 0) +
    (analyticsData.inProgressTasks || 0);
  const overdueTasks = analyticsData.dueDateTasks || 0;
  return (
    <div className="summary-cards-row">
      <div className="summary-card total" title="Total number of tasks created.">
        <div className="summary-title">Total Tasks</div>
        <div className="summary-value">{totalTasks}</div>
      </div>
      <div className="summary-card completed" title="Number of tasks marked as completed.">
        <div className="summary-title">Completed</div>
        <div className="summary-value">{analyticsData.completedTasks || 0}</div>
      </div>
      <div className="summary-card pending" title="Tasks that are not yet completed.">
        <div className="summary-title">Pending</div>
        <div className="summary-value">{pendingTasks}</div>
      </div>
      <div className="summary-card overdue" title="Tasks with a due date.">
        <div className="summary-title">Overdue</div>
        <div className="summary-value">{overdueTasks}</div>
      </div>
    </div>
  );
};

// 3D Pie Slice component
function PieSlice({ startAngle, endAngle, color, radius = 2, height = 0.5 }) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.absarc(0, 0, radius, startAngle, endAngle, false);
  shape.lineTo(0, 0);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: false,
  });
  return (
    <mesh geometry={geometry} position={[0, 0, -height / 2]}>
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// 3D Pie Chart component
function PieChart3D({ data, colors, height = 0.5, radius = 2 }) {
  const total = data.reduce((a, b) => a + b, 0);
  let start = 0;
  let slices = [];
  for (let i = 0; i < data.length; i++) {
    const value = data[i];
    const angle = (value / total) * Math.PI * 2;
    const end = start + angle;
    slices.push(
      <PieSlice
        key={i}
        startAngle={start}
        endAngle={end}
        color={colors[i % colors.length]}
        radius={radius}
        height={height}
      />
    );
    start = end;
  }
  return (
    <group>
      {slices}
    </group>
  );
}

function RotatingPieChart3D(props) {
  const ref = useRef();
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.005;
    }
  });
  return <group ref={ref}>{props.children}</group>;
}

const PieChart3DCard = ({ analyticsData }) => {
  const values = [
    analyticsData.backlogTasks || 0,
    analyticsData.todoTasks || 0,
    analyticsData.inProgressTasks || 0,
    analyticsData.completedTasks || 0,
  ];
  const colors = ['#36A2EB', '#FFCE56', '#FF6384', '#4BC0C0'];
  const labels = ['Backlog', 'To-do', 'In-Progress', 'Completed'];
  return (
    <div className="chart-card" style={{height: 350, width: 350}} title="3D Pie Chart: Task Status">
      <div className="chart-title">Task Status (3D Pie)</div>
      <Canvas camera={{ position: [0, 4, 6], fov: 50 }} style={{height: 260, width: 340, background: 'transparent'}}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 10, 7]} intensity={0.7} />
        <RotatingPieChart3D>
          <PieChart3D data={values} colors={colors} />
        </RotatingPieChart3D>
        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>
      <div style={{display: 'flex', justifyContent: 'center', gap: 12, marginTop: 10}}>
        {labels.map((label, i) => (
          <span key={label} style={{display: 'flex', alignItems: 'center', fontSize: 13}}>
            <span style={{display: 'inline-block', width: 14, height: 14, background: colors[i], borderRadius: '50%', marginRight: 6}}></span>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

const ProgressBar = ({ value, max, color }) => {
  const percent = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="progress-bar-bg" title={`Progress: ${value} of ${max}`}>
      <div className="progress-bar-fill" style={{ width: `${percent}%`, background: color }}></div>
    </div>
  );
};

const AnalyticsTable = ({ analyticsData }) => {
  const total =
    (analyticsData.backlogTasks || 0) +
    (analyticsData.todoTasks || 0) +
    (analyticsData.inProgressTasks || 0) +
    (analyticsData.completedTasks || 0);
  return (
    <div className="analytics-container">
      <div className="analytics-table-list">
        <div className="analytics-table-row" title="Backlog tasks are yet to be started.">
          <GoDotFill color='#36A2EB' size={20} />
          <span>Backlog Tasks</span>
          <span className="analytics-table-value">{analyticsData.backlogTasks}</span>
          <ProgressBar value={analyticsData.backlogTasks} max={total} color="#36A2EB" />
        </div>
        <div className="analytics-table-row" title="To-do tasks are planned but not started.">
          <GoDotFill color='#FFCE56' size={20} />
          <span>To-do Tasks</span>
          <span className="analytics-table-value">{analyticsData.todoTasks}</span>
          <ProgressBar value={analyticsData.todoTasks} max={total} color="#FFCE56" />
        </div>
        <div className="analytics-table-row" title="Tasks currently in progress.">
          <GoDotFill color='#FF6384' size={20} />
          <span>In-Progress Tasks</span>
          <span className="analytics-table-value">{analyticsData.inProgressTasks}</span>
          <ProgressBar value={analyticsData.inProgressTasks} max={total} color="#FF6384" />
        </div>
        <div className="analytics-table-row" title="Tasks that are completed.">
          <GoDotFill color='#4BC0C0' size={20} />
          <span>Completed Tasks</span>
          <span className="analytics-table-value">{analyticsData.completedTasks}</span>
          <ProgressBar value={analyticsData.completedTasks} max={total} color="#4BC0C0" />
        </div>
      </div> 
      <div className="analytics-table-list">
        <div className="analytics-table-row" title="Low priority tasks.">
          <GoDotFill color='#4BC0C0' size={20} />
          <span>Low Priority</span>
          <span className="analytics-table-value">{analyticsData.lowPriorityTasks}</span>
        </div>
        <div className="analytics-table-row" title="Moderate priority tasks.">
          <GoDotFill color='#FFCE56' size={20} />
          <span>Moderate Priority</span>
          <span className="analytics-table-value">{analyticsData.moderatePriorityTasks}</span>
        </div>
        <div className="analytics-table-row" title="High priority tasks.">
          <GoDotFill color='#FF6384' size={20} />
          <span>High Priority</span>
          <span className="analytics-table-value">{analyticsData.highPriorityTasks}</span>
        </div>
        <div className="analytics-table-row" title="Tasks with a due date.">
          <GoDotFill color='#246bfd' size={20} />
          <span>Due Date Tasks</span>
          <span className="analytics-table-value">{analyticsData.dueDateTasks}</span>
        </div>
      </div>
    </div>
  );
};

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const userID = localStorage.getItem('userID');
      const response = await fetch(`https://pro-manage-one.vercel.app/api/card/analytics?userID=${userID}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    }
  };

  return (
    <div>
      <p style={{ fontSize: '17px', fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', margin: '5vh'}}>Analytics</p>
      {analyticsData && <>
        <SummaryCards analyticsData={analyticsData} />
        <div className="analytics-charts-row">
          <PieChart3DCard analyticsData={analyticsData} />
        </div>
        <AnalyticsTable analyticsData={analyticsData} />
      </>}
    </div>
  );
};

export default Analytics;
