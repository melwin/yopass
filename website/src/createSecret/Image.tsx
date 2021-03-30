import { faPaste } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { encrypt, message } from 'openpgp';
import { useState } from 'react';
// import { useCallback, useState } from 'react';
import {
  Error,
  OneTime,
  SpecifyPasswordToggle,
  SpecifyPasswordInput,
} from './CreateSecret';
import Expiration from '../shared/Expiration';
import Result from '../displaySecret/Result';
import { randomString, uploadFile } from '../utils/utils';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Grid, Typography } from '@material-ui/core';

type BlobLikeFile = File | null

const Image = () => {
//  const maxSize = 1024 * 1024 * 5;
  const [error, setError] = useState('');
  const { t } = useTranslation();
  const [result, setResult] = useState({
    password: '',
    customPassword: false,
    uuid: '',
  });

  const { control, register, handleSubmit, watch } = useForm({
    defaultValues: {
      generateDecryptionKey: true,
      secret: '',
      password: '',
      expiration: '3600',
      onetime: true,
    },
  });

  const [images, setImages] = useState([] as Blob[]);

  const transformImages = (data: DataTransfer) => {
    // NOTE: This needs to be a for loop, it's a list like object
    const blobs = [] as Blob[];
    for (let i = 0; i < data.items.length; i++) {
      if (['image/gif', 'image/png', 'image/jpeg', 'image/bmp'].includes(data.items[i].type) !== false) {
        let blob: BlobLikeFile = data.items[i].getAsFile();
        if (blob) {
          blobs.push(blob);
        }
      } else {
        setError('Invalid format.');
      }
    }

    setImages([...images, ...blobs]);
    handlePaste(blobs);
  }

  const onPaste = (e: React.ClipboardEvent) => {
    e.clipboardData && e.clipboardData.items.length > 0
      ? transformImages(e.clipboardData)
      : setError(`Sorry, to bother you but there was no image pasted.`)
  }

//  (window as unknown as HTMLElement).addEventListener('paste', onPaste);

  const form = watch();
  const handlePaste = //useCallback(
    (blobs:Blob[]) => {
      console.log('handlePaste - images:' + blobs.length);
      handleSubmit(onSubmit)();

      blobs.forEach(async (blob) => {
        console.log('reading ' + blob.type);
        console.log('onload' + form.password);
        const pw = form.password ? form.password : randomString();
        const file = await encrypt({
          armor: true,
          message: message.fromBinary(
            new Uint8Array(await blob.arrayBuffer()),
            PastedFilename,
          ),
          passwords: pw,
        });
        const { data, status } = await uploadFile({
          expiration: parseInt(form.expiration),
          message: file.data,
          one_time: form.onetime,
        });

        if (status !== 200) {
          console.log(data);
          setError(data.message);
        } else {
          setResult({
            uuid: data.message,
            password: pw,
            customPassword: form.password ? true : false,
          });
        }
      });
    }
        // ,
        // [form, handleSubmit, images]);

  const onSubmit = () => {};

  const generateDecryptionKey = watch('generateDecryptionKey');

  if (result.uuid) {
    return (
      <Result
        uuid={result.uuid}
        password={result.password}
        prefix="f"
        customPassword={result.customPassword}
      />
    );
  }
  return (
    <Grid onPaste={onPaste}>
      <Error message={error} onClick={() => setError('')} />
      <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container justifyContent="center">
            <Typography variant="h4">{t('Click here and paste to upload')}</Typography>
          </Grid>
          <Grid container justifyContent="center">
            <Typography variant="caption" display="block">
              {t(
                'Paste an image to encrypt it and share securely with others.',
              )}
            </Typography>
          </Grid>
          <Grid container justifyContent="center">
            <FontAwesomeIcon
              color="black"
              size="8x"
              icon={faPaste}
            />
          </Grid>
        <Grid container justifyContent="center" mt="15px">
          <Expiration control={control} />
        </Grid>
        <Grid container justifyContent="center">
          <OneTime register={register} />
          <SpecifyPasswordToggle register={register} />
          <Grid container justifyContent="center">
            {!generateDecryptionKey && (
              <SpecifyPasswordInput register={register} />
            )}
          </Grid>
        </Grid>
      </form>      
    </Grid>
  );
};

export default Image;
export const PastedFilename = "Pasted image";
