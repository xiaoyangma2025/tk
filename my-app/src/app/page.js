'use client';

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);

  // 轮询检查预测结果
  useEffect(() => {
    let interval;
    
    // 如果有预测结果且状态不是"succeeded"，则开始轮询
    if (prediction && prediction.id && (prediction.status === "starting" || prediction.status === "processing")) {
      setIsPolling(true);
      interval = setInterval(async () => {
        try {
          console.log("轮询检查预测状态:", prediction.id);
          const response = await fetch(`/api/predictions/${prediction.id}`);
          const updatedPrediction = await response.json();
          
          console.log("更新的预测结果:", updatedPrediction);
          
          // 更新预测结果
          setPrediction(updatedPrediction);
          
          // 如果状态变为"succeeded"或出错，停止轮询
          if (updatedPrediction.status === "succeeded" || updatedPrediction.status === "failed" || updatedPrediction.status === "canceled") {
            clearInterval(interval);
            setIsPolling(false);
          }
        } catch (error) {
          console.error("轮询错误:", error);
          clearInterval(interval);
          setIsPolling(false);
          setError("轮询检查预测结果时出错");
        }
      }, 3000); // 每3秒检查一次
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [prediction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const prompt = e.target.prompt.value;

    try {
      setError(null);
      console.log("提交提示词:", prompt);
      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });
      const prediction = await response.json();
      console.log("API响应:", prediction);
      if (response.status !== 201) {
        setError(prediction.detail);
        return;
      }
      setPrediction(prediction);
    } catch (error) {
      console.error("错误:", error);
      setError(error.message);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-5">
      <h1 className="py-6 text-center font-bold text-2xl">
        Dream something with{" "}
        <a href="https://replicate.com/black-forest-labs/flux-schnell?utm_source=project&utm_project=getting-started">
          Flux Schnell
        </a>
      </h1>

      <form className="w-full flex" onSubmit={handleSubmit}>
        <input
          type="text"
          className="flex-grow"
          name="prompt"
          placeholder="Enter a prompt to display an image"
        />
        <button className="button" type="submit">
          Go!
        </button>
      </form>

      {error && <div className="text-red-500 mt-2">{error}</div>}

      {isPolling && (
        <div className="mt-4 text-blue-500">
          正在生成图像，请稍候...
        </div>
      )}

      {prediction && (
        <>
          <pre className="mt-4 p-2 bg-gray-100 text-xs overflow-auto">
            {JSON.stringify(prediction, null, 2)}
          </pre>
          {prediction.output && prediction.output.length > 0 && (
            <div className="image-wrapper mt-5">
              <Image
                src={prediction.output[prediction.output.length - 1]}
                alt="output"
                sizes="100vw"
                height={768}
                width={768}
              />
            </div>
          )}
          <p className="py-3 text-sm opacity-50">状态: {prediction.status}</p>
        </>
      )}
    </div>
  );
}