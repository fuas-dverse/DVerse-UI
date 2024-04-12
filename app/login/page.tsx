import Login from "@/components/Auth/Login";
import Logout from "@/components/Auth/Logout";
import {auth} from "@/auth";

export default async function LoginPage() {
	const session = await auth();

	return (
		<div>
			{
				session ?
				(
					<>
                        <div>Your name is {session.user?.name}</div>
                        <Logout/>
                    </>
				) :
				(
					<Login/>
				)
			}
		</div>
	);
}