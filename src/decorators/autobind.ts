// autobind method Decorator
export function AutoBind(_: any, _2: string, description: PropertyDescriptor) {
  const curMethod = description.value;
  const newDescription: PropertyDescriptor = {
    configurable: true,
    enumerable: false,
    get() {
      return curMethod.bind(this);
    },
  };
  return newDescription;
}
