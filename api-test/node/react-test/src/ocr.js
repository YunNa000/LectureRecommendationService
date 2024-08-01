import React, { useState } from "react";
import Tesseract from "tesseract.js";

const OCRComponent = () => {
  const [images, setImages] = useState([]);
  const [ocrResults, setOcrResults] = useState([]);
  const [lecClassNames, setLecClassNames] = useState([]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const performOCR = async () => {
    const results = [];
    const allLecClassNames = new Set();

    for (const image of images) {
      const result = await Tesseract.recognize(
        URL.createObjectURL(image),
        "kor",
        {
          logger: (m) => console.log(m),
        }
      );
      results.push(result.data.text);
    }

    setOcrResults(results);

    // 서버로 OCR 결과 전송
    for (const result of results) {
      const response = await fetch("http://127.0.0.1:8000/process_text/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: result }),
      });

      const data = await response.json();
      data.lecClassNames.forEach((lecClassName) => {
        allLecClassNames.add(lecClassName);
      });
    }

    setLecClassNames(Array.from(allLecClassNames));
  };

  return (
    <div>
      <input type="file" multiple onChange={handleImageChange} />
      <button onClick={performOCR}>OCR</button>
      <ul>
        {ocrResults.map((result, index) => (
          <li key={index}>{result}</li>
        ))}
      </ul>
      <ul>
        {lecClassNames.map((lecClassName, index) => (
          <li key={index}>{lecClassName}</li>
        ))}
      </ul>
    </div>
  );
};

export default OCRComponent;
