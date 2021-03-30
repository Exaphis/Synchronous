from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_401_UNAUTHORIZED


@api_view(['POST'])
def hook(request):
    # TODO: deny requests not from tusd
    print(request.headers['Hook-Name'])
    print(request.data)

    return Response(status=HTTP_401_UNAUTHORIZED)  # 200 OK
