import { PropsWithChildren } from 'react';
import { View } from 'react-native';

const Layout = ({ children }: PropsWithChildren) => {
  return <View className="flex-1 items-center justify-center gap-8 p-4">{children}</View>;
};

export default Layout;
