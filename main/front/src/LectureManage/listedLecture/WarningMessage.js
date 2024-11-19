import React, { useEffect, useState } from 'react';

const WarningMessage = ({ totalGPA, totalCredits, maxCredits, checkedLectures }) => {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const shouldShowWarning =
      (totalGPA < 3.5 && totalCredits > maxCredits) ||
      (totalGPA >= 3.5 && totalCredits > maxCredits);

    if (shouldShowWarning) {
      setShowWarning(true);
      const timer = setTimeout(() => {
        setShowWarning(false);
      }, 3000);

      return () => clearTimeout(timer); 
    }
  }, [totalGPA, totalCredits, maxCredits]);

  if (!showWarning) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 998, backgroundColor: '#ffcc00', padding: '10px', borderRadius: '5px' }}>
      <p>
        {checkedLectures.some((lecture) => lecture.lecName.includes("광운인되기"))
          ? `광운인되기를 포함해서 ${maxCredits}학점 까지 들을 수 있어요.`
          : `${maxCredits}학점 까지 들을 수 있어요.`}
      </p>
    </div>
  );
};

export default WarningMessage;
