// Device management configuration
let deviceConfig = {
    maxDevicesPerUser: 2,
    lastLimitChange: null,
    lastResetInfo: null
};

// Function to update device limit
export const updateDeviceLimit = (newLimit, resetInfo = null) => {
    if (typeof newLimit === 'number' && newLimit >= 1 && newLimit <= 10) {
        const previousLimit = deviceConfig.maxDevicesPerUser;
        deviceConfig.maxDevicesPerUser = newLimit;
        deviceConfig.lastLimitChange = {
            timestamp: new Date(),
            previousLimit,
            newLimit,
            resetInfo
        };
        return true;
    }
    return false;
};

// Function to get current device limit
export const getDeviceLimit = () => {
    return deviceConfig.maxDevicesPerUser;
};

// Function to get full device config
export const getDeviceConfig = () => {
    return { ...deviceConfig };
};

// Function to get limit change history
export const getLimitChangeHistory = () => {
    return deviceConfig.lastLimitChange;
};

export default deviceConfig;
