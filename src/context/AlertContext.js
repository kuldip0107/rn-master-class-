import React, { createContext, useContext, useState, useEffect } from 'react';
import CustomAlertModal from '../components/common/CustomAlertModal';

const AlertContext = createContext({
  showAlert: () => {},
  hideAlert: () => {},
});

export const useAlert = () => useContext(AlertContext);

// Global singleton reference so CustomAlert.alert can be called anywhere
const globalAlertRef = {
  current: null,
};

export const CustomAlert = {
  show: (config) => {
    if (globalAlertRef.current) {
      globalAlertRef.current.show(config);
    } else {
      console.warn('CustomAlert: AlertProvider is not mounted yet.');
    }
  },
  alert: (title, message, buttons, options = {}) => {
    let parsedType = options.type || 'info';

    // Smart type detection from title / buttons if not explicitly passed
    if (!options.type) {
      const lowerTitle = (title || '').toLowerCase();
      if (
        lowerTitle.includes('error') ||
        lowerTitle.includes('fail') ||
        lowerTitle.includes('denied')
      ) {
        parsedType = 'error';
      } else if (
        lowerTitle.includes('success') ||
        lowerTitle.includes('congrat') ||
        lowerTitle.includes('saved') ||
        lowerTitle.includes('done') ||
        lowerTitle.includes('🎓')
      ) {
        parsedType = 'success';
      } else if (
        lowerTitle.includes('warning') ||
        lowerTitle.includes('confirm') ||
        lowerTitle.includes('clear') ||
        lowerTitle.includes('delete') ||
        lowerTitle.includes('remove')
      ) {
        parsedType = lowerTitle.includes('delete') ? 'error' : 'warning';
      }
    }

    // Default button if not provided
    const formattedButtons =
      buttons && buttons.length > 0
        ? buttons
        : [{ text: 'OK', onPress: () => {} }];

    CustomAlert.show({
      title,
      message,
      buttons: formattedButtons,
      type: parsedType,
      cancelable: options.cancelable !== false,
      icon: options.icon,
    });
  },
  success: (title, message, onOk) => {
    CustomAlert.show({
      title: title || 'Success',
      message,
      type: 'success',
      buttons: [{ text: 'OK', onPress: onOk }],
    });
  },
  error: (title, message, onOk) => {
    CustomAlert.show({
      title: title || 'Error',
      message,
      type: 'error',
      buttons: [{ text: 'OK', onPress: onOk }],
    });
  },
  warning: (title, message, onOk) => {
    CustomAlert.show({
      title: title || 'Warning',
      message,
      type: 'warning',
      buttons: [{ text: 'OK', onPress: onOk }],
    });
  },
  info: (title, message, onOk) => {
    CustomAlert.show({
      title: title || 'Information',
      message,
      type: 'info',
      buttons: [{ text: 'OK', onPress: onOk }],
    });
  },
  confirm: ({
    title = 'Confirm',
    message,
    onConfirm,
    onCancel,
    confirmText = 'Yes',
    cancelText = 'Cancel',
    isDestructive = false,
  }) => {
    CustomAlert.show({
      title,
      message,
      type: isDestructive ? 'error' : 'confirm',
      buttons: [
        { text: cancelText, style: 'cancel', onPress: onCancel },
        {
          text: confirmText,
          style: isDestructive ? 'destructive' : 'default',
          onPress: onConfirm,
        },
      ],
    });
  },
  hide: () => {
    if (globalAlertRef.current) {
      globalAlertRef.current.hide();
    }
  },
};

export const AlertProvider = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const showAlert = (configOrTitle, message, buttons, options) => {
    if (typeof configOrTitle === 'object' && configOrTitle !== null) {
      setAlertConfig(configOrTitle);
      setIsVisible(true);
    } else {
      CustomAlert.alert(configOrTitle, message, buttons, options);
    }
  };

  const hideAlert = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    globalAlertRef.current = {
      show: (cfg) => {
        setAlertConfig(cfg);
        setIsVisible(true);
      },
      hide: () => {
        setIsVisible(false);
      },
    };
    return () => {
      globalAlertRef.current = null;
    };
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <CustomAlertModal
        visible={isVisible}
        config={alertConfig}
        onClose={hideAlert}
      />
    </AlertContext.Provider>
  );
};
