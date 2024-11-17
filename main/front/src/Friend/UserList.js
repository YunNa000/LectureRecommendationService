import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import "./Friend.css";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [myUserId, setMyUserId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUserId = () => {
      const cookieUserId = Cookies.get("user_id");
      if (cookieUserId) {
        setMyUserId(cookieUserId);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!searchQuery) {
        setUsers([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `http://localhost:8000/users?userName=${searchQuery}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUsers(data);
      } catch (e) {
        setError("유저 데이터 가져오기 오류: " + e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [searchQuery]);

  const handleFriendRequest = async (friendId) => {
    try {
      const response = await fetch("http://localhost:8000/add_friend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id1: myUserId.toString(),
          user_id2: friendId.toString(),
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      alert(result.message);
    } catch (e) {
      alert("친구 추가 오류:" + e.message);
    }
  };

  const handleSearchInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setSearchQuery(searchTerm);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="friend-list-container">
      <form onSubmit={handleSearchSubmit} className="friend-search-form">
        <input
          type="text"
          placeholder="유저 이름 입력..."
          value={searchTerm}
          onChange={handleSearchInputChange}
          className="friend-search-input"
        />
        <button type="submit" className="friend-search-button">
          검색
        </button>
      </form>
      {error && <div class="center-text">해당 유저가 존재하지 않습니다.</div>}
      {loading ? (
        <div className="loading-message">검색 중...</div>
      ) : (
        searchQuery && (
          <div className="search-results">
            {users.length > 0 ? (
              users.map((user) => (
                <div key={user.user_id} className="friend-item">
                  <div className="friend-info">
                    <div className="friend-name">{user.userName}</div>
                    <div className="friend-major">{user.userMajor}</div>
                  </div>
                  <button
                    onClick={() => handleFriendRequest(user.user_id)}
                    className="friend-request-button"
                  >
                    친구 추가
                  </button>
                </div>
              ))
            ) : (
              <div></div>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default UserList;
