import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Form, Link, useActionData, useSearchParams } from '@remix-run/react';
import type { V2_MetaFunction, ActionArgs } from '@remix-run/node';
import {
  validatePassword,
  validateUsername,
  validateUrl,
} from '~/lib/validators';
import { badRequest } from '~/models/request.server';
import { createUserSession, login } from '~/models/user.server';

export const meta: V2_MetaFunction = () => {
  const description = 'Login to your FastLane Fusion Account';

  return [
    { name: 'description', content: description },
    { name: 'twitter:description', content: description },
    { title: 'FLF | Login' },
  ];
};

export const action = async ({ request }: ActionArgs) => {
  const form = await request.formData();
  const password = form.get('password');
  const username = form.get('username');
  const redirectTo = validateUrl(
    (form.get('redirectTo') as string) || '/jokes'
  );

  if (typeof password !== 'string' || typeof username !== 'string') {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: 'Form not submitted correctly',
    });
  }

  const fields = { password, username };

  const fieldErrors = {
    password: validatePassword(password),
    username: validateUsername(username),
  };

  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({
      fieldErrors,
      fields,
      formError: null,
    });
  }

  const user = await login({ ...fields });
  console.log({ user });
  if (!user) {
    return badRequest({
      fieldErrors: null,
      fields,
      formError: 'Invalid username and/or password',
    });
  }
  return createUserSession(user.id, redirectTo);
};

export default function Login() {
  const [searchParams] = useSearchParams();

  const actionData = useActionData<typeof action>();
  return (
    <div className="col-span-full row-span-full flex items-center justify-center">
      <Card className="bg-secondary ring-2 ring-primary">
        <CardHeader className="">
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Login to your FastLane Fusion Account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post">
            <Input
              type="hidden"
              name="redirectTo"
              value={searchParams.get('redirectTo') ?? undefined}
            />
            <Label htmlFor="username-input">
              Username:
              <Input
                type="text"
                name="username"
                id="username-input"
                placeholder="username"
                required
                min="4"
                max="127"
                defaultValue={actionData?.fields?.username}
                aria-invalid={Boolean(actionData?.fieldErrors?.username)}
                aria-errormessage={
                  actionData?.fieldErrors?.username
                    ? 'username-error'
                    : undefined
                }
              />
            </Label>
            <Label htmlFor="password-input">
              Password:
              <Input
                type="password"
                name="password"
                id="password-input"
                placeholder="password"
                required
                min="6"
                max="4"
                defaultValue={actionData?.fields?.password}
                aria-invalid={Boolean(actionData?.fieldErrors?.password)}
                aria-errormessage={
                  actionData?.fieldErrors?.password
                    ? 'password-error'
                    : undefined
                }
              />
            </Label>
            <div className="flex justify-center pt-6">
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
          </Form>
          <CardFooter>
            <Link to="." className="mx-auto">
              Forgot Password?
            </Link>
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  );
}
