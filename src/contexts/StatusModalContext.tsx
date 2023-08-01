import { useState, useContext, createContext, useEffect } from "react";
import { View, TouchableOpacity, Text, Animated } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import tw from "@src/utils/tailwind";

interface StatusEntity {
  status: "error" | "success" | "loading";
  message: string;
}
type CurrentStatusType = StatusEntity | null;

type StatusModalContentType = {
  currentStatus: CurrentStatusType;
  setStatus: (language: StatusEntity) => void;
};

const statusLiveTime = 5000;
let statusTimer: ReturnType<typeof setTimeout>;

const StatusModalContext = createContext<StatusModalContentType | null>(null);

const StatusModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentStatus, setCurrentStatus] = useState<CurrentStatusType>(null);
  // const [lineWidth] = useState(new Animated.Value(100));
  const [containerWidth, setContainerWidth] = useState(0);
  const [lineWidth] = useState(new Animated.Value(containerWidth));

  const animateLine = () => {
    Animated.timing(lineWidth, {
      toValue: 0,
      duration: statusLiveTime,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    if (currentStatus && containerWidth) {
      lineWidth.setValue(containerWidth);
      animateLine();
    }
  }, [currentStatus, containerWidth]);

  const setStatus = (entity: CurrentStatusType) => {
    setCurrentStatus(entity);

    // Clear previous timer in case some new status was applied until first one
    // is finished
    clearTimeout(statusTimer);

    // If `null` then it was actually closed so no need to close again.
    if (entity !== null) {
      statusTimer = setTimeout(() => {
        setCurrentStatus(null);
      }, statusLiveTime);
    }
  };

  const closeStatus = () => {
    lineWidth.setValue(0);
    setCurrentStatus(null);
  };

  return (
    <StatusModalContext.Provider value={{ currentStatus, setStatus }}>
      {children}
      {currentStatus && (
        <View
          style={tw`absolute flex flex-row items-start gap-2 px-4 py-3 overflow-hidden rounded-lg shadow-lg  top-3 right-3 left-3 bg-background-secondary`}
          onLayout={(event) =>
            setContainerWidth(event.nativeEvent.layout.width)
          }
        >
          {/* Indicator */}
          <View style={tw`absolute h-[3px] w-full left-0 top-0 right-0 flex`}>
            <Animated.View
              style={[
                tw`w-full h-full`,
                currentStatus.status === "success" && tw`bg-content-success`,
                currentStatus.status === "error" && tw`bg-content-error`,
                { width: lineWidth },
              ]}
            />
          </View>

          {currentStatus.status === "error" && (
            <MaterialIcons
              name="error"
              size={20}
              color={tw.color("content-error")}
            />
          )}
          {currentStatus.status === "success" && (
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={tw.color("content-success")}
            />
          )}

          <Text style={tw`text-base font-medium text-content-primary`}>
            {currentStatus.message}
          </Text>
          <TouchableOpacity
            style={tw`absolute top-1 right-0.5 w-5 h-5`}
            onPress={closeStatus}
          >
            <Ionicons
              name="close-outline"
              size={24}
              color={tw.color("content-secondary")}
            />
          </TouchableOpacity>
        </View>
      )}
    </StatusModalContext.Provider>
  );
};

const useStatusModalContext = (): StatusModalContentType => {
  const ctx = useContext(StatusModalContext);
  if (ctx === null) {
    throw new Error("Context not available");
  }
  return ctx;
};

export type { StatusEntity };
export { StatusModalContext, StatusModalProvider, useStatusModalContext };
