import React from 'react';
import { FormikProps, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { FieldWrapper } from './FieldWrapper';
import { patch } from '../../utils/api';
import { useSession } from '../../state/session/SessionProvider';
import { ServerErrors } from './ServerErrors';
import { FormWrapper } from './FormWrapper';
import { UserResponse, UserDto } from '../../../../shared';

interface ProfileFormValues {
  name: string;
  email: string;
}

const SignupSchema = Yup.object().shape({
  name: Yup.string().required('Please enter your name.'),
  email: Yup.string()
    .email('Please enter a valid email address.')
    .required('Please enter your email address.'),
});

export const ProfileForm = () => {
  const {
    state: { user },
    actions,
  } = useSession();

  const update = async (
    values: ProfileFormValues,
    { setSubmitting, setStatus }: FormikHelpers<ProfileFormValues>
  ) => {
    const [user, error] = await patch<UserResponse, Partial<UserDto>>(
      'user',
      values
    );
    setSubmitting(false);
    if (error) return setStatus({ serverErrors: error.errors });
    if (user) actions.saveUser(user);
  };

  return (
    <FormWrapper
      className='profile-edit-form'
      initialValues={{
        name: user.name,
        email: user.email,
      }}
      validationSchema={SignupSchema}
      onSubmit={update}
    >
      {(formikProps: FormikProps<ProfileFormValues>) => (
        <>
          <a
            className='profile-edit-img'
            href='https://en.gravatar.com/'
            target='_blank'
            rel='noopener noreferrer'
          >
            <img src={user.avatar} alt='gravatar profile' />
          </a>
          <FieldWrapper
            {...formikProps}
            icon='profile'
            type='name'
            name='name'
          />
          <FieldWrapper
            {...formikProps}
            icon='email'
            type='email'
            name='email'
          />
          <ServerErrors status={formikProps.status} />
          <div className='form-actions-right'>
            <button
              type='submit'
              disabled={formikProps.isSubmitting || !formikProps.dirty}
            >
              Save
            </button>
          </div>
        </>
      )}
    </FormWrapper>
  );
};
