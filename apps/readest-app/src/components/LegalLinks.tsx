import { useEnv } from '@/context/EnvContext';
import { useTranslation } from '@/hooks/useTranslation';
import Link from './Link';

const LegalLinks = () => {
  const _ = useTranslation();
  const { appService } = useEnv();

  const termsUrl =
    appService?.isIOSApp || appService?.isMacOSApp
      ? 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/'
      : 'https://readest.com/terms-of-service';

  return (
    <div className='my-2.5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs'>
      <Link
        href={termsUrl}
        className='font-medium text-primary underline underline-offset-4 decoration-primary/40 transition-colors duration-150 hover:text-primary/80 hover:decoration-primary active:opacity-75'
      >
        {_('Terms of Service')}
      </Link>
      <span className='h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-700' aria-hidden='true' />
      <Link
        href='https://readest.com/privacy-policy'
        className='font-medium text-primary underline underline-offset-4 decoration-primary/40 transition-colors duration-150 hover:text-primary/80 hover:decoration-primary active:opacity-75'
      >
        {_('Privacy Policy')}
      </Link>
    </div>
  );
};

export default LegalLinks;