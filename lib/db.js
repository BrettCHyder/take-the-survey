import postgres from 'postgres';
let connection;
export function db(){if(!process.env.DATABASE_URL)throw Error('Database not connected');return connection??=postgres(process.env.DATABASE_URL,{max:1,prepare:false,ssl:'require'})}
export async function fulfill(session){const sql=db();await sql.begin(async tx=>{const rows=await tx`UPDATE payments SET counted=true WHERE session_id=${session.id} AND counted=false RETURNING browser_token`;if(!rows.length)return;await tx`UPDATE totals SET yes=yes+1 WHERE id=1`;await tx`INSERT INTO browser_limits(token,blocked_until) VALUES(${rows[0].browser_token},now()+interval '1 hour') ON CONFLICT(token) DO UPDATE SET blocked_until=GREATEST(browser_limits.blocked_until,EXCLUDED.blocked_until)`})}
