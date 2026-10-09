const reactNativeComponents = [
  {
    title: "View & Layout Components",
    data: [
      {
        id: "1",
        name: "View",
        description: "Basic building block for UI layout",
        componentData: require('./commponent data/view.json')
      },
      {
        id: "2",
        name: "SafeAreaView",
        description: "Renders content within safe area boundaries",
        componentData: require('./commponent data/safearea view.json')
      },
      {
        id: "3",
        name: "KeyboardAvoidingView",
        description: "Adjusts UI when keyboard appears",
        componentData: require('./keyboardavoiding.json')
      },
      {
        id: "4",
        name: "ScrollView",
        description: "Scrollable container for content",
        componentData: require('./scrollview.json')
      },
      {
        id: "5",
        name: "FlatList",
        description: "Efficient list rendering for large data",
        componentData: require('./flatelist.json')
      },
      {
        id: "6",
        name: "SectionList",
        description: "List with section headers",
        componentData: require('./sectionlist.json')
      },
      {
        id: "7",
        name: "VirtualizedList",
        description: "Base implementation for FlatList & SectionList",
        componentData: require('./virtualizedlist.json')
      }
    ]
  },
  {
    title: "Text & Input Components",
    data: [
      {
        id: "8",
        name: "Text",
        description: "Display text content",
        componentData: require('./text.json')
      },
      {
        id: "9",
        name: "TextInput",
        description: "User text input field",
        componentData: require('./textinput.json')
      }
    ]
  },
  {
    title: "Buttons & Controls",
    data: [
      {
        id: "10",
        name: "Button",
        description: "Basic cross-platform button component",
        componentData: require('./button.json')
      },
      {
        id: "11",
        name: "Pressable",
        description: "Core component wrapper for tap & touch gestures",
        componentData: require('./pressable.json')
      },
      {
        id: "12",
        name: "Switch",
        description: "Boolean toggle input component",
        componentData: require('./switch.json')
      },
      {
        id: "13",
        name: "Slider",
        description: "Selecting a single value from a range of values",
        componentData: require('./slider.json')
      },
      {
        id: "14",
        name: "Picker",
        description: "Select option dropdown component",
        componentData: require('./picker.json')
      },
      {
        id: "15",
        name: "CheckBox",
        description: "Selectable box for boolean states",
        componentData: require('./checheckbox.json')
      }
    ]
  },
  {
    title: "Touchables",
    data: [
      {
        id: "16",
        name: "TouchableOpacity",
        description: "Wrapper for making views respond appropriately to touches",
        componentData: require('./touchableopacity.json')
      },
      {
        id: "17",
        name: "TouchableHighlight",
        description: "Wrapper for touches showing underlay color",
        componentData: require('./touchablehighlight.json')
      },
      {
        id: "18",
        name: "TouchableWithoutFeedback",
        description: "Touch handler without visual feedback",
        componentData: require('./touchablewithoutfeedback.json')
      },
      {
        id: "19",
        name: "TouchableNativeFeedback",
        description: "Android ripple effect touch response",
        componentData: require('./touchablenativefeedback.json')
      }
    ]
  },
  {
    title: "Media & Feedback",
    data: [
      {
        id: "20",
        name: "Image",
        description: "Component for displaying images",
        componentData: require('./image.json')
      },
      {
        id: "21",
        name: "ActivityIndicator",
        description: "Displays a circular loading indicator",
        componentData: require('./Activityindicator.json')
      },
      {
        id: "22",
        name: "ProgressBarAndroid",
        description: "Horizontal progress bar for Android",
        componentData: require('./progressbarAndroid.json')
      },
      {
        id: "23",
        name: "RefreshControl",
        description: "Pull-to-refresh component inside ScrollView",
        componentData: require('./Refreshcontrol.json')
      },
      {
        id: "24",
        name: "Modal",
        description: "Present content above an enclosing view",
        componentData: require('./modal.json')
      }
    ]
  },
  {
    title: "System & Dialogs",
    data: [
      {
        id: "25",
        name: "Alert",
        description: "Launches native alert dialog",
        componentData: require('./alert.json')
      },
      {
        id: "26",
        name: "ToastAndroid",
        description: "Displays native toast messages on Android",
        componentData: require('./ToastAndroid.json')
      },
      {
        id: "27",
        name: "ActionSheetIOS",
        description: "Displays native iOS action sheets",
        componentData: require('./ActionSheetios.json')
      },
      {
        id: "28",
        name: "StatusBar",
        description: "Controls application status bar appearance",
        componentData: require('./statusbar.json')
      },
      {
        id: "29",
        name: "Vibration",
        description: "Triggers device vibration pattern",
        componentData: require('./Vibration.json')
      }
    ]
  },
  {
    title: "Animations & Gestures",
    data: [
      {
        id: "30",
        name: "Animated View",
        description: "Animatable view container",
        componentData: require('./Animatedview.json')
      },
      {
        id: "31",
        name: "Animated Text",
        description: "Animatable text component",
        componentData: require('./animated text.json')
      },
      {
        id: "32",
        name: "LayoutAnimation",
        description: "Automatically animates view layout updates",
        componentData: require('./layoutAnimated.json')
      },
      {
        id: "33",
        name: "PanResponder",
        description: "Reconciles multiple touches into a gesture",
        componentData: require('./panresponder.json')
      }
    ]
  },
  {
    title: "APIs & Utilities",
    data: [
      {
        id: "34",
        name: "Dimensions",
        description: "API for getting window and screen dimensions",
        componentData: require('./Dimensions.json')
      },
      {
        id: "35",
        name: "useWindowDimensions",
        description: "Hook for responsive layout dimensions",
        componentData: require('./useWindowDimensions.json')
      },
      {
        id: "36",
        name: "PixelRatio",
        description: "Gives access to device pixel density",
        componentData: require('./PixelRatio.json')
      },
      {
        id: "37",
        name: "Platform",
        description: "Detects device OS and platform versions",
        componentData: require('./plateform.json')
      },
      {
        id: "38",
        name: "Appearance",
        description: "Access system theme preference (dark/light)",
        componentData: require('./Appearance.json')
      },
      {
        id: "39",
        name: "BackHandler",
        description: "Detect Android hardware back button presses",
        componentData: require('./BackHandler.json')
      },
      {
        id: "40",
        name: "Linking",
        description: "General interface for interacting with incoming/outgoing links",
        componentData: require('./Linking.json')
      },
      {
        id: "41",
        name: "Keyboard",
        description: "API to listen for software keyboard events",
        componentData: require('./keyboard.json')
      },
      {
        id: "42",
        name: "PermissionsAndroid",
        description: "API to request Android runtime permissions",
        componentData: require('./permissionAndroid.json')
      },
      {
        id: "43",
        name: "StyleSheet",
        description: "Abstraction layer for creating component styles",
        componentData: require('./StylSheet.json')
      }
    ]
  },
  {
    title: "Navigation",
    data: [
      {
        id: "44",
        name: "NavigationContainer",
        description: "Root container managing navigation tree",
        componentData: require('./navigation container.json')
      },
      {
        id: "45",
        name: "Stack Navigator",
        description: "Stack-based screen transition navigation",
        componentData: require('./stack navigator .json')
      },
      {
        id: "46",
        name: "Tab Navigator",
        description: "Bottom tab bar navigation system",
        componentData: require('./tab navigator.json')
      },
      {
        id: "47",
        name: "Drawer Navigator",
        description: "Side drawer menu navigation",
        componentData: require('./Drawer Navigator.json')
      }
    ]
  }
];

export default reactNativeComponents;
