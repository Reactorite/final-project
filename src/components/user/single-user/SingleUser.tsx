import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { UserDataType } from "../../../types/UserDataType";
import { getUserData } from "../../../services/users.service";
import { Button, Card } from "react-bootstrap";
import "./SingleUser.css";
import getRanking from "../../../utils/ranking/ranking";

export default function SingleUser() {
  const [user, setUser] = useState<UserDataType | null>(null);
  const userId = useParams<{ id: string }>().id;

  useEffect(() => {
    const fetchUser = async () => {
      if (userId) {
        await getUserData(userId)
          .then((data: Record<string, UserDataType> | null) => {
            if (data && Object.keys(data).length > 0) {
              setUser(data[Object.keys(data)[0]]);
            }
          })
          .catch((err) => {
            console.error("Error fetching user data:", err);
          });
      }
    };

    fetchUser();
  }, []);


  return (
    <>
      <div className="single-user-container" style={{ display: "flex", justifyContent: "center", flexDirection: "row", alignItems: "center" }}>
        {user && (
          <Card className="card-appear" style={{ width: "20rem" }}>
            <Card.Img variant="top" />
            <Card.Body>
              <Card.Title>{user.username}</Card.Title>
              <Card.Text>
                <strong>First name:</strong> {user.firstName}
              </Card.Text>
              <Card.Text>
                <strong>Last name:</strong> {user.lastName}
              </Card.Text>
              <Card.Text>
                <strong>Points:</strong> {user.globalPoints}
              </Card.Text>
              <Card.Text>
                <strong>Rank:</strong> {getRanking(user.globalPoints)}
              </Card.Text>
            </Card.Body>
            <div className="card-buttons">
              <Button variant="primary" /*href={`/users/${userId}/edit`}*/ style={{ width: "8rem" }}>
                Play 1v1
              </Button>
            </div>
          </Card>
        )}
        <img className="img-appear" src="/images/3272151_475309-PGDLDX-12.jpg" alt="warrior" style={{ height: "60vh" }} />
      </div>
    </>
  );
}