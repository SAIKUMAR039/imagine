"use client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Image from "next/image";
import React, { useState } from "react";

export const MainContainer = () => {
  const [image, setImage] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [Ans, setAns] = useState<string | null>(null);
  const [relatedQues, setRelatedQues] = useState<string[]>([]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0]);
    }
  };

  const fileToGenerativePart = async (
    file: File
  ): Promise<{
    inlineData: { data: string; mimeType: string };
  }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        const base64Content = base64Data.split(",")[1];
        resolve({
          inlineData: {
            data: base64Content,
            mimeType: file.type,
          },
        });
      };
      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  };

  const identifyImage = async (additionalPrompt: string = "") => {
    if (!image) return;
    setLoading(true);
    const genAI = new GoogleGenerativeAI(
      process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY!
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    try {
      const imageParts = await fileToGenerativePart(image);
      const result = await model.generateContent([
        `Identify this image and provide its name and important information including a brief explanation about that image. ${additionalPrompt}`,
        imageParts,
      ]);

      const response = await result.response;
      const text = await response.text();
      const cleanedText = text
        .trim()
        .replace(/\n\n/g, "\n")
        .replace(/```/g, "")
        .replace(/`/g, "")
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/-\s*/g, "")
        .replace(/#/g, "")
        .replace(/_/g, "")
        .replace(/~/g, "")
        .replace(/>/g, "");

      setResult(cleanedText);
      generateKeywords(cleanedText);
      questions(cleanedText);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateKeywords = (text: string) => {
    const words = text.split(/\s+/);
    const keywordsSet = new Set<string>();

    words.forEach((word) => {
      if (
        word.length > 4 &&
        ![
          "this",
          "that",
          "and",
          "or",
          "the",
          "a",
          "an",
          "is",
          "are",
          "was",
          "were",
          "be",
          "been",
          "being",
          "have",
          "has",
          "had",
          "do",
          "does",
          "did",
          "will",
          "would",
          "shall",
          "should",
          "may",
          "might",
          "must",
          "can",
          "could",
          "of",
          "in",
          "on",
          "at",
          "to",
          "for",
          "with",
          "as",
          "by",
          "from",
          "about",
          "into",
          "through",
          "over",
          "under",
          "above",
          "below",
          "between",
          "among",
          "out",
          "off",
          "up",
          "down",
          "around",
          "throughout",
          "along",
          "across",
          "against",
          "before",
          "after",
          "behind",
          "beneath",
          "beside",
          "between",
          "beyond",
          "inside",
          "outside",
          "underneath",
          "within",
          "without",
          "upon",
          "onto",
          "into",
          "toward",
          "image",
          "image,",
          "image.",
          "photo",
          "photo,",
          "photo.",
        ].includes(word.toLowerCase())
      ) {
        keywordsSet.add(word);
      }
    });
    setKeywords(Array.from(keywordsSet).slice(0, 6));
  };

  const regenerateContent = (keyword: string) => {
    identifyImage(`Focus more on aspects related to ${keyword}.`);
  };

  const questions = async (text: string) => {
    const genAI = new GoogleGenerativeAI(
      process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY!
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });
    try {
      const result = await model.generateContent([
        `Based on the following information about an image, generate 5 related questions that someone might ask to learn more about the subjects: ${text}
        
        Format the output as a simple list of questions, one per line.`,
      ]);
      const response = await result.response;
      const questions = (await response.text()).trim().split("\n");
      setRelatedQues(questions);
    } catch (error) {
      console.error(error);
    }
  };

  const askQues = async (ques: string) => {
    if (!image) return;
    setLoading(true);
    const genAI = new GoogleGenerativeAI(
      process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY!
    );
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    try {
      const imageParts = await fileToGenerativePart(image);
      const result = await model.generateContent([
        `Answer the following question based on the image: ${ques}`,
        imageParts,
      ]);
      const response = await result.response;
      const text = (await response.text()).trim().replace(/\n\n/g, "\n");
      setAns(text);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center">
            Identify Your Image
          </h2>
          <div className="mb-8">
            <label
              htmlFor="image-upload"
              className="block text-sm font-medium text-gray-700"
            >
              Upload Image
            </label>
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm to-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 file:cursor-pointer hover:file:bg-blue-100 transition duration-150 ease-in-out"
            />
          </div>
          {image && (
            <div className="mb-8 flex justify-center">
              <Image
                src={URL.createObjectURL(image)}
                alt="Uploaded image"
                width={300}
                height={300}
                className="rounded-lg shadow-md"
              />
            </div>
          )}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => identifyImage()}
              disabled={!image || loading}
              className="w-full bg-blue-600 py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
            >
              {loading ? "Identifying..." : "Identify"}
            </button>
          </div>

          {result && (
            <div className="bg-blue-50 p-8 border-t border-blue-100">
              <h3 className="text-2xl font-bold text-blue-800 mb-4">
                Image Information
              </h3>
              <div className="max-w-none">
                <p className="mt-2 text-gray-600">
                  {result.split("\n").map((line, index) => {
                    if (
                      line.startsWith("Important information:") ||
                      line.startsWith("Other Information")
                    ) {
                      return (
                        <h4
                          className="text-xl font-semibold mt-4 mb-2 text-blue-700"
                          key={index}
                        >
                          {line}
                        </h4>
                      );
                    } else {
                      return <span key={index}>{line}</span>;
                    }
                  })}
                </p>
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-blue-700">
                    Related Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword, index) => (
                      <button
                        type="button"
                        key={index}
                        onClick={() => regenerateContent(keyword)}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-200 transition duration-150 ease-in-out"
                      >
                        {keyword}
                      </button>
                    ))}
                  </div>
                </div>
                {relatedQues.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-blue-700">
                      Related Questions
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {relatedQues.map((ques, index) => (
                        <button
                          type="button"
                          key={index}
                          onClick={() => askQues(ques)}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-200 transition duration-150 ease-in-out"
                        >
                          {ques}
                        </button>
                      ))}
                    </div>
                    {Ans && (
                      <div className="mt-6">
                        <h4 className="text-lg font-semibold text-blue-700">
                          Answer
                        </h4>
                        <p className="mt-2 text-gray-600">{Ans}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <section id="how-it-works" className="mt-16 ">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105">
            <div className="text-3xl font-bold text-black mb-4">1</div>
            <h3 className="text-xl font-semibold text-blue-700 mb-4">
              Upload Image
            </h3>
            <p className="text-gray-600">
              Upload an image that you want to identify and get information
              about.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105">
            <div className="text-3xl font-bold text-black mb-4">2</div>

            <h3 className="text-xl font-semibold text-blue-700 mb-4">
              Identify Image
            </h3>
            <p className="text-gray-600">
              Click on the identify button to get information about the image.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105">
            <div className="text-3xl font-bold text-black mb-4">3</div>

            <h3 className="text-xl font-semibold text-blue-700 mb-4">
              Get Information
            </h3>
            <p className="text-gray-600">
              Get information about the image including the name and important
              information.
            </p>
          </div>
        </div>
      </section>

      <section id="features" className="mt-16">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
          Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105">
            <div className="text-3xl font-bold text-black mb-4">1</div>
            <h3 className="text-xl font-semibold text-blue-700 mb-4">
              Accurate Identification
            </h3>
            <p className="text-gray-600">
              Get accurate identification of the image and important information
              about it.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105">
            <div className="text-3xl font-bold text-black mb-4">2</div>

            <h3 className="text-xl font-semibold text-blue-700 mb-4">
              Detailed Information
            </h3>
            <p className="text-gray-600">
              Get detailed information about the image including a brief
              explanation.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105">
            <div className="text-3xl font-bold text-black mb-4">3</div>

            <h3 className="text-xl font-semibold text-blue-700 mb-4">
              Fast Results
            </h3>
            <p className="text-gray-600">
              Get fast results when you upload an image for identification.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105">
            <div className="text-3xl font-bold text-black mb-4">4</div>

            <h3 className="text-xl font-semibold text-blue-700 mb-4">
              User_Friendly Interface
            </h3>
            <p className="text-gray-600">
              User-friendly interface that makes it easy to upload and identify
              images.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};
