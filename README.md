# Smart Trip Planner 🗺️

A MERN Stack + FastAPI based application that helps users select a destination and retrieve top-rated places based on Google reviews.


## 🚀 Features

- **Destination-based place recommendations**: Users can select a destination and receive tailored recommendations for top-rated places to visit.
- **Google reviews integration**: The application integrates with Google reviews to ensure that users receive reliable and up-to-date information about various places.
- **FastAPI backend**: Utilizes FastAPI for efficient data handling and processing, ensuring quick and responsive interactions.
- **MERN stack front-end**: Built with MongoDB, Express.js, React, and Node.js to deliver a dynamic and responsive user interface.
- **Interactive map visualization**: The application integrates a map feature, allowing users to easily visualize their destinations. Additionally, it calculates the **distance and estimated travel time** for upcoming locations, providing a seamless travel planning experience.

---

## 🗺️ How the Map Feature Works

The map functionality enables users to see their destinations on an interactive interface while also calculating route details such as distance and estimated travel time. Below is a **sequence diagram** that illustrates how the system processes user requests to display routes and calculate travel times dynamically.

### 📌 Sequence Diagram: Map Activity

![Map Activity Sequence Diagram](path/to/your/sequence-diagram.png)

> *This diagram visually represents the interaction between the user, the frontend (React), backend services (FastAPI and Node.js), external APIs (Google Maps or OSRM), and the response flow.*

---

## 🌟 Project Idea

The core idea behind Smart Trip Planner is to simplify the travel planning process by providing users with curated recommendations based on real user reviews. Whether planning a trip to a new city or exploring local attractions, users can rely on Smart Trip Planner to discover the best places to visit, eat, and explore. The integration with Google reviews adds an extra layer of trust and reliability, making it easier for users to make informed decisions about their travel plans.

## 🛠️ Technologies Used

- **Frontend**: React + Vite, Tailwind CSS
- **Backend**: FastAPI, Node.js, Express.js
- **Database**: MongoDB
- **APIs**: Google Places API for fetching reviews and place details

## 📂 Project Structure

- **Backend**: Contains the FastAPI backend implementation.
- **Frontend**: Contains the React front-end implementation.
- **Database**: MongoDB for storing user data and recommendations.

## 📚 How to Use

1. **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/SmartTripPlanner.git
    ```
2. **Navigate to the project directory**:
    ```bash
    cd SmartTripPlanner
    ```
3. **Install dependencies for the backend**:
    ```bash
    cd Backend-FastAPI
    pip install -r requirements.txt
    ```
4. **Run the backend server**:
    ```bash
    uvicorn main:app --reload
    ```
5. **Open a new terminal window** and navigate to the project directory:
    ```bash
    cd Server
    npm install
    ```
6. **Run the backend server**:
    ```bash
    npm run dev
    ```
7. **Install dependencies for the frontend**:
    ```bash
    cd SmartTripPlanner
    npm install
    ```
8. **Run the frontend server**:
    ```bash
    npm run dev
    ```

## 🤝 Contributing

Contributions are welcome! Please fork this repository and submit a pull request for any enhancements or bug fixes.
