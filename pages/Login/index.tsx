import React, { FormEvent, useCallback, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Form, Header, Input, Label, LinkContainer, Error } from '@pages/SignUp/style';
import useInput from '@hooks/useInput';
import useSWR from 'swr';
import fetcher from '@utils/fetcher';
import { IUser } from '@typings/db';

const Login = () => {
  const [logInError, setLogInError] = useState<boolean>(false);
  const [email, onChangeEmail] = useInput('');
  const [password, onChangePassword] = useInput('');

  // 어떤 useSWR의 반환값으로써의 mutate는 해당 useSWR의 key가 이미 바인딩되어 있는 상태이다. 그래서 굳이 key 인자를 넘겨주지 않아도 된다.
  const { data: userData, mutate, isLoading } = useSWR<IUser | false>('http://localhost:3095/api/users', fetcher);

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLogInError(false);
      axios
        // .post(
        //   '/api/users/login',
        .post(
          'http://localhost:3095/api/users/login',
          { email, password },
          {
            withCredentials: true,
          },
        )
        .then(() => {
          mutate();
        })
        .catch((error) => {
          setLogInError(error.response?.status === 401);
        });
    },
    [email, password, mutate],
  );

  if (isLoading) {
    return <div>로딩중...</div>;
  }

  if (userData) {
    const workspaceUrl = userData.Workspaces[0].url;
    return <Navigate replace to={`/workspace/${workspaceUrl}/channel/일반`} />;
  }

  // console.log(error, userData);
  // if (!error && userData) {
  //   console.log('로그인됨', userData);
  //   return <Redirect to="/workspace/sleact/channel/일반" />;
  // }

  return (
    <div id="container">
      <Header>Sleact</Header>
      <Form onSubmit={onSubmit}>
        <Label id="email-label">
          <span>이메일 주소</span>
          <div>
            <Input type="email" id="email" name="email" value={email} onChange={onChangeEmail} />
          </div>
        </Label>
        <Label id="password-label">
          <span>비밀번호</span>
          <div>
            <Input type="password" id="password" name="password" value={password} onChange={onChangePassword} />
          </div>
          {logInError && <Error>이메일과 비밀번호 조합이 일치하지 않습니다.</Error>}
        </Label>
        <Button type="submit">로그인</Button>
      </Form>
      <LinkContainer>
        아직 회원이 아니신가요?&nbsp;
        <Link to="/signup">회원가입 하러가기</Link>
      </LinkContainer>
    </div>
  );
};

export default Login;
