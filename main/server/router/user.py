from typing import List, Dict
from fastapi import HTTPException, APIRouter
from db import db_connect
from model import UserBasicInfo, userID

router = APIRouter()


@router.post("/user/update")
async def update_user_info(input_data: UserBasicInfo):
    conn = db_connect()
    cursor = conn.cursor()

    update_query = """
        UPDATE User
        SET hakBun = ?,
            bunBan = ?,
            userYear = ?,
            userMajor = ?,
            userName = ?,
            isForeign = ?,
            isMultipleMajor = ?,
            whatMultipleMajor = ?,
            whatMultipleMajorDepartment = ?
        WHERE user_id = ?
    """

    try:

        cursor.execute(update_query, (
            input_data.hakBun,
            input_data.bunBan,
            input_data.userYear,
            input_data.userMajor,
            input_data.username,
            input_data.isForeign,
            input_data.isMultipleMajor,
            input_data.whatMultipleMajor,
            input_data.whatMultipleMajorDepartment,
            input_data.user_id
        ))

        conn.commit()

        return {"message": "update user info"}

    except Exception as e:

        conn.rollback()
        print("Error occurred:", str(e))
        raise HTTPException(status_code=434, detail=str(e))

    finally:
        cursor.close()
        conn.close()


@router.post("/user/data", response_model=UserBasicInfo)
async def return_basic_user_data(request: userID):
    conn = db_connect()
    cursor = conn.cursor()

    query = """
        SELECT hakBun, bunBan, userYear, userMajor, userName, isForeign, isMultipleMajor, whatMultipleMajor, whatMultipleMajorDepartment
        FROM User
        WHERE user_id = ?
    """

    try:
        cursor.execute(query, (request.user_id,))
        user_data = cursor.fetchone()

        if user_data is None:
            raise HTTPException(status_code=434, detail="user not exist")

        return UserBasicInfo(
            user_id=request.user_id,
            hakBun=user_data[0],
            bunBan=user_data[1],
            userYear=user_data[2],
            userMajor=user_data[3],
            username=user_data[4],
            isForeign=user_data[5],
            isMultipleMajor=user_data[6],
            whatMultipleMajor=user_data[7],
            whatMultipleMajorDepartment=user_data[8],
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()
