import React, { useState, useEffect, useCallback  } from 'react';
import Cookies from "js-cookie"




const FriendList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [myUserId, setMyUserId] = useState(''); // 문자열로 저장
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
              const response = await fetch(`http://localhost:8000/friends?userId=${myUserId}`);
              if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`+myUserId);
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
            alert('사용자 ID가 설정되지 않았습니다. 다시 로그인해주세요.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/delete_friend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
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
            setStatus(true);
        } catch (e) {
            alert('친구 삭제 오류: ' + e.message);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
  
    return (
      <div style={{ padding: '20px' }}>
        <h1 style={{ marginBottom: '20px' }}>Friend List</h1>
        <div>My User ID: {myUserId}</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>User ID</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Username</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Action</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.user_id}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.user_id}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.userName}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <button onClick={() => deleteFriendRequest(user.user_id)}>Delete Friend</button>
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <button>친구 시간표</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };


export default FriendList;