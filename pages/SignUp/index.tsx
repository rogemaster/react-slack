import React, { ChangeEvent, FormEvent, useCallback, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Header, Form, Label, Input, Button, LinkContainer, Error, Success } from './style';
import useInput from '@hooks/useInput';
import useSWR from 'swr';
import fetcher from '@utils/fetcher';
import { IUser } from '@typings/db';

const SignUp = () => {
  const [email, onChangeEmail] = useInput('');
  const [nickname, onChangeNickname] = useInput('');
  const [password, , setPassword] = useInput('');
  const [passwordCheck, , setPasswordCheck] = useInput('');
  const [mismatchError, setMismatchError] = useState(false);
  const [signUpError, setSignUpError] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const { data: userData, isLoading } = useSWR<IUser | false>('/api/users', fetcher);

  const onChangePassword = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
      setMismatchError(e.target.value !== password);
    },
    [passwordCheck],
  );

  const onChangePasswordCheck = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setPasswordCheck(e.target.value);
      setMismatchError(e.target.value !== password);
    },
    [password],
  );

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!mismatchError && nickname) {
        console.log('서버로 회원가입 하기');
      }

      // 직접 axios api 를 요청 할 경우 이전에 state 값을 초기화 처리 하고 비동기를 처리 하는것이 좋다.
      setSignUpError('');
      setSignUpSuccess(false);

      axios
        // .post('/api/users', { email, nickName, password })
        .post('/api/users', { email, nickname, password })
        .then((response) => {
          setSignUpSuccess(true);
          console.log(response);
        })
        .catch((error) => {
          setSignUpError(error.response.data);
        })
        .finally(() => {});
    },
    [mismatchError, nickname, email, password],
  );

  if (isLoading) {
    return <div>로딩중...</div>;
  }

  if (userData) {
    const workspaceUrl = userData.Workspaces[0].url;
    return <Navigate replace to={`/workspace/${workspaceUrl}/channel/일반`} />;
  }

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
        <Label id="nickname-label">
          <span>닉네임</span>
          <div>
            <Input type="text" id="nickname" name="nickname" value={nickname} onChange={onChangeNickname} />
          </div>
        </Label>
        <Label id="password-label">
          <span>비밀번호</span>
          <div>
            <Input type="password" id="password" name="password" value={password} onChange={onChangePassword} />
          </div>
        </Label>
        <Label id="password-check-label">
          <span>비밀번호 확인</span>
          <div>
            <Input
              type="password"
              id="password-check"
              name="password-check"
              value={passwordCheck}
              onChange={onChangePasswordCheck}
            />
          </div>
          {mismatchError && <Error>비밀번호가 일치하지 않습니다.</Error>}
          {!nickname && <Error>닉네임을 입력해주세요.</Error>}
          {signUpError && <Error>{signUpError}</Error>}
          {signUpSuccess && <Success>회원가입되었습니다! 로그인해주세요.</Success>}
        </Label>
        <Button type="submit">회원가입</Button>
      </Form>
      <LinkContainer>
        이미 회원이신가요?&nbsp;
        <Link to="/login">로그인 하러가기</Link>
      </LinkContainer>
    </div>
  );
};

export default SignUp;
