import React, { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import "./Friend.css";

const FriendList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myUserId, setMyUserId] = useState(""); // 문자열로 저장
  const [statusFriend, setStatus] = useState(false); // 문자열로 저장
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
    const fetchFriends = async () => {
      if (!myUserId) return; // myUserId가 없으면 함수 종료
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/friends?userId=${myUserId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}` + myUserId);
        }
        const data = await response.json();
        setUsers(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    setStatus(false);
    fetchFriends();
  }, [myUserId, statusFriend]); // myUserId가 변경될 때마다 실행

  const deleteFriendRequest = async (friendId) => {
    if (!myUserId) {
      alert("사용자 ID가 설정되지 않았습니다. 다시 로그인해주세요.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/delete_friend`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id1: myUserId.toString(),
            user_id2: friendId.toString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      alert(result.message);
      setStatus(true);
    } catch (e) {
      alert("친구 삭제 오류: " + e.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error)
    return (
      <p class="center-text">
        친구 추가 버튼을 눌러서
        <br />
        시간표를 공유하고 싶은 친구를 추가해주세요!
      </p>
    );

  return (
    <div className="friend-list-container">
      <div>
        {users.map((user) => (
          <div key={user.user_id} className="friend-item">
            <div className="friend-info">
              <p className="friend-name">{user.userName}</p>
              <p className="friend-major">{user.userMajor}</p>
            </div>
            <button
              onClick={() => deleteFriendRequest(user.user_id)}
              className="friend-action-button"
            >
              &gt;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendList;
