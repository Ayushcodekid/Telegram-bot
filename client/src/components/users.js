import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const ITEMS_PER_PAGE = 10; // Adjust based on backend pagination

  // Fetch users with pagination
  const fetchUsers = (page = 1) => {
    axios
      .get(`http://localhost:8000/users?page=${page}&limit=${ITEMS_PER_PAGE}`)
      .then((response) => {
        setUsers(response.data.users);
        setCurrentPage(response.data.currentPage);
        setTotalPages(response.data.totalPages);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  };

  // Search users
  const searchUsers = () => {
    axios
      .get(`http://localhost:8000/users/search?query=${searchQuery}`)
      .then((response) => {
        setUsers(response.data);
        setTotalPages(1); // Disable pagination during search
      })
      .catch((error) => {
        console.error("Error searching users:", error);
      });
  };

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

  // Activate a user
  const activateUser = (userId) => {
    axios
      .post(`http://localhost:8000/users/${userId}/activate`)
      .then(() => {
        alert("User activated successfully!");
        setUsers(users.map((u) => (u._id === userId ? { ...u, subscribed: true } : u)));
      })
      .catch((error) => {
        console.error("Error activating user:", error);
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

  // Handle page change
  const handlePageChange = (page) => {
    fetchUsers(page);
  };

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">User Management</h2>
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search by Chat ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="btn btn-primary mt-2" onClick={searchUsers}>
          Search
        </button>
      </div>
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
                  {user.subscribed ? (
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => blockUser(user._id)}
                    >
                      Block
                    </button>
                  ) : (
                    <button
                      className="btn btn-success btn-sm me-2"
                      onClick={() => activateUser(user._id)}
                    >
                      Activate
                    </button>
                  )}
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
      <div className="d-flex justify-content-center">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            className={`btn ${page === currentPage ? "btn-primary" : "btn-secondary"} mx-1`}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Users;
