
exports.getProperties = (req, res) => {
    // Logic for fetching properties
    res.send('Properties fetched');
  };
  
  // Function to get a specific property by ID
  exports.getPropertyById = (req, res) => {
    // Logic to fetch property by ID
    res.send(`Property ID: ${req.params.id}`);
  };
  