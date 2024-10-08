"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Header = () => {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src={"/logo.png"}
              alt="image analyser"
              width={50}
              height={50}
              className="mr-2"
            />
            <h1 className="text-2xl font-bold ">Image Identifyer</h1>
          </div>

          <nav>
            <ul className="flex space-x-4">
              <Link
                href={"#"}
                className="text-gray-600 hover:text-black  transition duration-150 ease-in-out"
              >
                Home
              </Link>
              <Link
                href={"#how-it-works"}
                className="text-gray-600 hover:text-black  transition duration-150 ease-in-out"
              >
                How it works
              </Link>
              <Link
                href={"#features"}
                className="text-gray-600 hover:text-black  transition duration-150 ease-in-out"
              >
                Features
              </Link>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
