export default function handler(req, res) {
  if (req.method === "POST") {
    // We don't need to do anything with the data, just acknowledge receipt
    res.status(200).json({ success: true, timestamp: Date.now() });
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
