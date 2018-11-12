const log_msg = msg => {
    console.log(
        `SENDING_MSG@[ ${timestamp()} ] +++\n${msg.guild.name}@${
            msg.channel.name
        }: ${msg}`
    );
};

const log_info = info => {
    console.log(`INFO@[ ${timestamp()} ]: ${info}`);
};

const timestamp = () => {
    let date = new Date();
    let format = time => {
        return time < 10 ? `0${time}` : time;
    };
    let hrs = format(date.getHours());
    let min = format(date.getMinutes());
    let sec = format(date.getSeconds());
    let day = format(date.getDate());
    let mon = format(date.getMonth() + 1);
    let year = date.getFullYear();
    return `${day}/${mon}/${year}T${hrs}:${min}:${sec}`;
};

module.exports = {
    log_msg,
    log_info
};
