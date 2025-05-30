const Itinerary = require("../models/itinerary");

const updateItinerary = async(req, res) => {
    try {
        const { id } = req.params;
        const updatedTrip = req.body;

        const trip = await Itinerary.findByIdAndUpdate(id, updatedTrip, {
          new: true,
        });

        if (!trip) {
          return res.status(404).json({ message: "Trip not found" });
        }

        res.json(trip);
      } catch (error) {
        console.error("Error updating trip:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
}

const deleteItinerary = async (req, res) => {
    try{
        const { id } = req.params;
        const deletedTrip = await Itinerary.findByIdAndDelete(id);
        console.log(deletedTrip);
        console.log(id);
        if (!deletedTrip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        res.json({ message: "Trip deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting trip:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}
module.exports = { updateItinerary , deleteItinerary};
