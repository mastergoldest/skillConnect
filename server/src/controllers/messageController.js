
import mongoose from "mongoose";
import Connection from "../models/Connection.js";
import Message from "../models/Message.js";

// GET MESSAGES FOR A CONNECTION
export const getConnectionMessages = async (req, res) => {
  try {
    const { connectionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(connectionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid connection ID.",
      });
    }

    // Confirm that the logged-in student belongs to this connection.
    const connection = await Connection.findOne({
      _id: connectionId,
      $or: [
        { requester: req.user._id },
        { provider: req.user._id },
      ],
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Connection not found.",
      });
    }

    if (connection.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "This conversation is no longer active.",
      });
    }

    const messages = await Message.find({
      connection: connectionId,
    })
      .populate("sender", "fullName")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("Get connection messages error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load messages.",
    });
  }
};

// SEND MESSAGE
// export const sendConnectionMessage = async (req, res) => {
//   try {
//     const { connectionId } = req.params;
//     const content = req.body.content?.trim();

//     if (!mongoose.Types.ObjectId.isValid(connectionId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid connection ID.",
//       });
//     }

//     if (
//       typeof content !== "string" ||
//       content.length < 1 ||
//       content.length > 3000
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Message must contain between 1 and 3000 characters.",
//       });
//     }

//     // Only the requester or provider can send messages.
//     const connection = await Connection.findOne({
//       _id: connectionId,
//       status: "active",
//       $or: [
//         { requester: req.user._id },
//         { provider: req.user._id },
//       ],
//     });

//     if (!connection) {
//       return res.status(404).json({
//         success: false,
//         message: "Active connection not found.",
//       });
//     }

//     const message = await Message.create({
//       connection: connectionId,
//       sender: req.user._id,
//       content,
//     });

//     // Update the connection's latest activity.
//     connection.lastMessageAt = message.createdAt;
//     await connection.save();

//     await message.populate("sender", "fullName");

//     return res.status(201).json({
//       success: true,
//       message: "Message sent successfully.",
//       data: message,
//     });
//   } catch (error) {
//     console.error("Send connection message error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Unable to send message.",
//     });
//   }
// };

export const sendConnectionMessage = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const content = req.body.content?.trim();

    if (!mongoose.Types.ObjectId.isValid(connectionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid connection ID.",
      });
    }

    if (
      typeof content !== "string" ||
      content.length < 1 ||
      content.length > 3000
    ) {
      return res.status(400).json({
        success: false,
        message: "Message must contain between 1 and 3000 characters.",
      });
    }

    // Verify that the student belongs to this active connection.
    const connection = await Connection.findOne({
      _id: connectionId,
      status: "active",
      $or: [
        { requester: req.user._id },
        { provider: req.user._id },
      ],
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Active connection not found.",
      });
    }

    // Save the message permanently in MongoDB.
    const message = await Message.create({
      connection: connectionId,
      sender: req.user._id,
      content,
    });

    // Update the connection's latest activity.
    connection.lastMessageAt = message.createdAt;
    await connection.save();

    // Include the sender's name in the message response.
    await message.populate("sender", "fullName");

    // Broadcast the saved message to everyone in this conversation.
    const io = req.app.get("io");

    io.to(`connection:${connectionId}`).emit(
      "new_message",
      message
    );

    return res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      data: message,
    });
  } catch (error) {
    console.error("Send connection message error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send message.",
    });
  }
};

