from dataclasses import dataclass
from typing import Optional, Any

import requests

SPACEDECK_EMAIL = 'admin@synchronous.localhost'
SPACEDECK_PASSWORD = 'y(@#"}T6d65B!v?V'  # TODO: change this
SPACEDECK_INVITE_CODE = 'top-sekrit'  # TODO: change this in spacedeck config


class SpacedeckAPIException(Exception):
    pass

@dataclass
class Space:
    def __post_init__(self):
        self.space_id = self._id

    _id: str  # id of the space
    name: str  # name of the space
    space_type: str  # type of the space? only seen 'space' so far, folder might be possible
    creator_id: str  # id of the space's creator
    parent_space_id: str  # id of the parent space
    access_mode: str  # public/private
    password: Optional[str]
    edit_hash: str  # hash that enables editing (/spaces/<_id>?spaceAuth=<edit_hash>)
    edit_slug: str  # slug for generating edit URL
    editors_locking: Any
    thumbnail_uri: Optional[str]
    width: Optional[int]
    height: Optional[int]
    background_color: Optional[str]
    background_uri: Optional[str]
    created_at: str
    updated_at: str
    thumbnail_url: Optional[str]
    thumbnail_updated_at: Optional[str]
    createdAt: str  # possibly the same as created_at?
    updatedAt: str  # possibly the same as updated_at?
    space_id: str = None  # original name: _id, added to not be a private var

    def get_url(self, nickname='Guest'):
        return f'{SpacedeckClient.BASE_URL}/spaces/{self._id}?spaceAuth={self.edit_hash}&nickname={nickname}'


class SpacedeckClient:
    _instance = None

    @staticmethod
    def __new__(cls):
        """
        Make SpacedeckClient into a singleton class
        """
        if cls._instance is None:
            cls._instance = super(SpacedeckClient, cls).__new__(cls)

        return cls._instance

    BASE_URL = 'http://spacedeck:9666'

    def __init__(self):
        self.session = requests.Session()

        sd_session_resp = self.session.post(
            self.BASE_URL + '/api/sessions',
            json={'email': SPACEDECK_EMAIL, 'password': SPACEDECK_PASSWORD}
        )

        # create a new spacedeck user if our user was not found
        if sd_session_resp.status_code == 404:
            resp = self.session.post(
                self.BASE_URL + '/api/users',
                json={'email': SPACEDECK_EMAIL,
                      'nickname': '',
                      'password': SPACEDECK_PASSWORD,
                      'password_confirmation': SPACEDECK_PASSWORD,
                      'invite_code': SPACEDECK_INVITE_CODE}
            )
            assert resp.status_code == 201

            sd_session_resp = self.session.post(
                self.BASE_URL + '/api/sessions',
                json={'email': SPACEDECK_EMAIL, 'password': SPACEDECK_PASSWORD}
            )

        sd_session = sd_session_resp.json()
        self.token = sd_session['token']
        self.session.headers.update({'X-Spacedeck-Auth': self.token})

    def __str__(self):
        return f'SpacedeckClient(token={self.token})'

    def create_space(self, name='Untitled Space'):
        data = self.session.post(
            self.BASE_URL + '/api/spaces',
            json={'name': name}
        ).json()

        space_id = data['_id']

        # must include name in PUT request because spacedeck calculates
        # slug from name no matter if name exists or not
        data = self.session.put(
            self.BASE_URL + f'/api/spaces/{space_id}',
            json={'access_mode': 'public', 'name': name}
        ).json()

        return Space(**data)

    def delete_space(self, space_id):
        resp = self.session.delete(
            self.BASE_URL + f'/api/spaces/{space_id}',
        )

        return resp.ok

    def set_artifacts(self, space_id, artifacts_json):
        resp = self.session.post(
            self.BASE_URL + f'/api/spaces/{space_id}/artifacts',
            data=artifacts_json,
            # required so string is recognized as json and parsed as JS object
            headers={'Content-Type': 'application/json'}
        )

        return resp.ok

    def get_artifacts(self, space_id):
        resp = self.session.get(
            self.BASE_URL + f'/api/spaces/{space_id}/artifacts'
        )

        if not resp.ok:
            raise SpacedeckAPIException(resp.text)

        return resp.text


def main():
    with open('/tmp/artifacts.json', 'rb') as artifacts:
        out = artifacts.read()
    print(out)

    SpacedeckClient.BASE_URL = 'http://localhost:9666'
    client = SpacedeckClient()
    space = client.create_space('test')
    resp = client.set_artifacts(space.space_id, out)
    print(resp)

    print(space)
    print(space.get_url())


if __name__ == '__main__':
    main()
