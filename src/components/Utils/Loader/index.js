import React, { useState, useEffect } from 'react';
import '../../ComponentsCss/utils/Loader/Loader.css';

const Loader = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulating API call with setTimeout
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Dummy data
         setData(null);

        // const dummyData = {
        //     id: 1,
        //     name: 'Shivam',
        //     email: 'shivam@gmail.com',
        //     age: 21
        //   };

        // setData(dummyData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="no-data-container">
        <img
          src="No data-bro.png"
          alt="No Data"
          className="no-data-image"
        />
       <p className="no-data-text">NO DATA AVAILABLE</p>
      </div>
    );
  }

  return (
    <div className="data-container">
      <h2>User Data</h2>
      <p><strong>Name:</strong> {data.name}</p>
      <p><strong>Email:</strong> {data.email}</p>
      <p><strong>Age:</strong> {data.age}</p>
    </div>
  );
};

export default Loader;


