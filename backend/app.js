const express = require('express');
const app = express();
const port = process.env.PORT || 3100;

// Increase payload size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ...existing code...

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});