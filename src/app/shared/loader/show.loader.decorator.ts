import { LoaderService } from './loader.service';
import { LoaderOptions } from './loader.options';

export const ShowLoader = (opts: LoaderOptions): any => {
  return (
    target: object,
    key: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]): Promise<any> {
      // access the loader
      const loader = LoaderService.instance;

      loader.show(opts);
      try {
        return await originalMethod.apply(this, args);
      } finally {
        loader.hide(opts);
      }
    };

    return descriptor;
  };
};
