import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

export const populateData = () => {
  const csvFilePath = path.resolve(process.cwd(), 'earthquakes1970-2014.csv');
  return new Promise((resolve, reject) => {
    const items = [];
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          const { DateTime, Latitude, Longitude, Magnitude } = row;
          const date = new Date(DateTime);
          if (isNaN(date.getTime())) {
            throw new Error(`Invalid DateTime: ${DateTime}`);
          }
          const latitude = parseFloat(Latitude);
          const longitude = parseFloat(Longitude);
          const magnitude = parseFloat(Magnitude);
          if (isNaN(latitude) || isNaN(longitude) || isNaN(magnitude)) {
            throw new Error(`Invalid data: Latitude=${Latitude}, Longitude=${Longitude}, Magnitude=${Magnitude}`);
          }
          items.push({
            id: `${latitude + 1}`,
            location: `${Latitude}, ${Longitude}`,
            magnitude,
            date: date.toISOString(),
          });
        } catch (error) {
          console.error(`Error processing row: ${JSON.stringify(row)} - ${error.message}`);
        }
      })
      .on('end', () => {
        console.log('CSV file successfully processed');
        resolve(items);
      })
      .on('error', (error) => {
        console.error('Error reading CSV file:', error);
        reject(error);
      });
  });
};