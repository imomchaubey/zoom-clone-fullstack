"""Smoke test of every endpoint. Run: python test_api.py"""
import os, tempfile
os.environ["DATABASE_URL"] = f"sqlite:///{tempfile.mkdtemp()}/t.db"
from fastapi.testclient import TestClient
from app.main import app

with TestClient(app) as c:
    assert c.get("/api/me").json()["name"] == "Om Prakash"
    up = c.get("/api/meetings/upcoming").json(); rc = c.get("/api/meetings/recent").json()
    print("upcoming:", len(up), "recent:", len(rc)); assert len(up) == 4 and len(rc) == 4

    inst = c.post("/api/meetings/instant", json={}).json(); code = inst["meeting_code"]
    print("instant:", inst["formatted_code"], inst["join_url"]); assert len(code) == 11

    sch = c.post("/api/meetings/schedule", json={"title": "Demo", "description": "d",
          "start": "2099-01-01T10:00:00Z", "duration_minutes": 30})
    assert sch.status_code == 201 and sch.json()["scheduled_start"].endswith("Z")
    assert len(c.get("/api/meetings/upcoming").json()) == 5

    assert c.get("/api/meetings/00000000000").status_code == 404           # validate existence
    assert c.get("/api/meetings/lookup", params={"q": inst["join_url"]}).status_code == 200   # full link
    assert c.get("/api/meetings/lookup", params={"q": inst["formatted_code"]}).status_code == 200  # spaced ID
    assert c.get("/api/meetings/lookup", params={"q": "123"}).status_code == 404
    assert c.post("/api/meetings/schedule", json={"title": " ", "start": "2099-01-01T10:00:00Z"}).status_code == 422

    host = c.post(f"/api/meetings/{code}/join", json={"display_name": "Om", "as_host": True}).json()["participant"]
    guest = c.post(f"/api/meetings/{code}/join", json={"display_name": "Guest"}).json()["participant"]
    assert host["role"] == "host" and guest["role"] == "participant"
    assert len(c.get(f"/api/meetings/{code}/participants").json()) == 2

    assert c.post(f"/api/meetings/{code}/mute-all?requester_id={guest['id']}").status_code == 403
    assert c.post(f"/api/meetings/{code}/mute-all?requester_id={host['id']}").status_code == 204
    assert [p["is_muted"] for p in c.get(f"/api/meetings/{code}/participants").json()] == [False, True]
    assert c.delete(f"/api/meetings/{code}/participants/{guest['id']}?requester_id={host['id']}").status_code == 204
    assert len(c.get(f"/api/meetings/{code}/participants").json()) == 1
    assert c.post(f"/api/meetings/{code}/end?requester_id={host['id']}").status_code == 204
    assert c.post(f"/api/meetings/{code}/join", json={"display_name": "Late"}).status_code == 410
    print("ALL TESTS PASSED")
