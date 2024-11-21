import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";

const Users = () => {
  const [users, setUsers] = useState([]);

  // Fetch all users
  useEffect(() => {
    axios
      .get("http://localhost:8000/users") // Replace with your backend URL
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, []);

  // Block a user
  const blockUser = (userId) => {
    axios
      .post(`http://localhost:8000/users/${userId}`, { action: "block" })
      .then(() => {
        alert("User blocked successfully!");
        setUsers(users.map((u) => (u._id === userId ? { ...u, subscribed: false } : u)));
      })
      .catch((error) => {
        console.error("Error blocking user:", error);
      });
  };

  // Delete a user
  const deleteUser = (userId) => {
    axios
      .post(`http://localhost:8000/users/${userId}`, { action: "delete" })
      .then(() => {
        alert("User deleted successfully!");
        setUsers(users.filter((u) => u._id !== userId));
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
      });
  };

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">User Management</h2>
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="thead-dark">
            <tr>
              <th>Chat ID</th>
              <th>Subscribed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.chatId}</td>
                <td>
                  <span className={`badge ${user.subscribed ? "bg-success" : "bg-danger"}`}>
                    {user.subscribed ? "Yes" : "No"}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => blockUser(user._id)}
                  >
                    Block
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteUser(user._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
