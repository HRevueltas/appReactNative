# Automation Lights Control App

A React Native mobile application developed under tight time constraints for controlling and scheduling lights in different sections of a building. This MVP (Minimum Viable Product) was built in just 2 weeks using Expo and React Native.

## Quick Overview

This rapid development project delivers essential functionality for:
- Immediate light control ⚡
- Basic scheduling system 🕒
- Activity logging 📝
- Real-time status updates 🔄

## Features
(Developed in Priority Order)

1. **Core Functions** (Week 1)
   - Manual light control
   - Basic section management
   - Simple on/off scheduling

2. **Enhanced Features** (Week 2)
   - Activity logging
   - Fixed scheduling
   - Section filtering

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Android Studio
- Java Development Kit (JDK)
- Android SDK
- Expo CLI

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/HRevueltas/appReactNative.git
```

2. Install dependencies:
```bash
cd appReactNative
npm install
```

3. Important: Configure ESP32 IP Address

The app requires proper configuration of the ESP32 server IP address. By default it uses http://192.168.194.93.
You must update this IP address to match your ESP32's IP in these files:
 - `components/ControlPanel.js`
 - `components/Scheduler.js`
 - `components/FixedScheduleScheduler.js`

4. Start the app:
```bash
npm start
```

5. Open the Expo Go app on your mobile device and scan the QR code to run the app.

## Technologies Used

- React Native
- Expo
- React Navigation
- Axios
- Moment.js
