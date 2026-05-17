import toast from "react-hot-toast";

interface MessageToastProps {
  t: any;
  messageId: string;
  senderName: string;
  content: string;
  img: string;
}

const MessageToast = ({
  t,
  messageId,
  senderName,
  content,
  img,
}: MessageToastProps) => {
  return (
    <div
      className={`${
        t.visible ? "animate-custom-enter" : "animate-custom-leave"
      } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="shrink-0 pt-0.5">
            <img className="h-10 w-10 rounded-full" src={img} alt="" />
          </div>

          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">{senderName}</p>

            <p className="mt-1 text-sm text-gray-500">{content}</p>
          </div>
        </div>
      </div>

      <div className="flex border-l border-gray-200">
        <button
          type="button"
          onClick={() => toast.remove(messageId)}
          className="relative z-50 w-full p-4 text-sm font-medium text-indigo-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default MessageToast;
