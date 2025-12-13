## User Table

id, name, email, password_hash, timezone, created_at

## Groups

id, name, created_by, created_at

## Group Members

id, group_id, user_id, role, joined_at

## Group Invites

id, group_id, code, expires_at, created_by, created_at

## Routine Blocks

id, user_id, group_id, date, start_time, end_time, title, visibility, color, created_at, updated_at

indexes -> (user_id, date), (group_id, date), (date)

## Activity Log

id, group_id, user_id, type, metadata, created_at

index -> (group_id, created_at at DESC)
