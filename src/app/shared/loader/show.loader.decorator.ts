import { LoaderService } from './loader.service';

export const ShowLoader = (): any => {
  return (
    target: object,
    key: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]): Promise<any> {
      // access the loader
      const loader = LoaderService.instance;

      loader.show();
      try {
        return await originalMethod.apply(this, args);
      } finally {
        loader.hide();
      }
    };

    return descriptor;
  };
};
