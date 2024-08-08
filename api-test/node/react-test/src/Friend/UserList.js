import React, { useState, useEffect } from 'react';
import Cookies from "js-cookie"

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [myUserId, setMyUserId] = useState(''); // 문자열로 저장

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
        try {
          const response = await fetch('http://localhost:8000/users');
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setUsers(data);
          setLoading(false);
        } catch (e) {
          setError('유저 데이터 가져오기 오류: ' + e.message);
          setLoading(false);
        }
      };
  
      fetchUsers();
    }, []);
  
    const handleFriendRequest = async (friendId) => {
      try {
        const response = await fetch('http://localhost:8000/add_friend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id1: myUserId.toString(),
            user_id2: friendId.toString(), // 문자열로 변환
          }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const result = await response.json();
        alert(result.message); // 성공 또는 실패 메시지를 표시
      } catch (e) {
        alert('친구 추가 오류:'  + e.message);
      }
    };
  
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
  
    return (
      <div style={{ padding: '20px' }}>
        <h1 style={{ marginBottom: '20px' }}>User List</h1>
        <div>My User ID: {myUserId}</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>User ID</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Username</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.user_id}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.user_id}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.userName}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <button onClick={() => handleFriendRequest(user.user_id)}>Add Friend</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <input type="text" id="searchInput" placeholder="검색어를 입력하세요"></input><button onclick="search()">검색</button>
      </div>
    );
  };

export default UserList;